import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useKitchen } from '../storage/context';
import { ingredients } from '../domain/catalog';
import {
  addDays,
  purchase,
  today,
  uid,
  usable,
  validDate,
} from '../domain/kitchen';
import {
  Body,
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Heading,
  Note,
  Page,
  Row,
} from '../components/ui';
import { Batch } from '../domain/types';

function BatchCard({ batch }: { batch: Batch }) {
  const { state, execute, busy } = useKitchen();
  const [expiry, setExpiry] = useState(batch.expiry || '');
  const [verified, setVerified] = useState(batch.verified);
  const [error, setError] = useState('');
  const i = ingredients[batch.ingredientId];
  return (
    <Card>
      <Heading>
        {i.zh} / {i.en}
      </Heading>
      <Body>
        {i.persistent
          ? '常备调味品 · 默认不逐餐扣量'
          : `剩余 ${batch.remaining}${i.unit}`}
      </Body>
      <Note>
        购入 {batch.purchased} ·{' '}
        {batch.expiry ? `有效期 ${batch.expiry}` : '未录有效期，请核对包装'}
        {'\n'}
        {usable(batch, state!.profile)
          ? batch.expiry && batch.expiry <= addDays(today(), 2)
            ? '临期，请优先检查使用'
            : '已由你核对 · 可计入库存'
          : '已过期、未核对或储存不兼容 · 不参与扣减'}
      </Note>
      <Field
        label="有效期 YYYY-MM-DD"
        value={expiry}
        onChangeText={setExpiry}
        placeholder="按包装填写，可留空"
      />
      <Chip
        label="已核对安全状态及储存要求"
        selected={verified}
        onPress={() => setVerified((v) => !v)}
      />
      {error ? <Note>{error}</Note> : null}
      <Row>
        <Button
          title="保存核对"
          secondary
          disabled={busy}
          onPress={() => {
            if (expiry && !validDate(expiry)) {
              setError('日期格式应为有效的 YYYY-MM-DD。');
              return;
            }
            setError('');
            execute((s) => ({
              ...s,
              batches: s.batches.map((b) =>
                b.id === batch.id
                  ? { ...b, expiry: expiry || null, verified }
                  : b,
              ),
            }));
          }}
        />
        <Button
          title="用完 / 丢弃"
          secondary
          disabled={busy}
          onPress={() =>
            Alert.alert(
              '将这批标记为用完或丢弃？',
              '该批次将不再参与推荐和库存扣减。',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '确认',
                  style: 'destructive',
                  onPress: () =>
                    execute((s) => ({
                      ...s,
                      batches: s.batches.map((b) =>
                        b.id === batch.id ? { ...b, discarded: true } : b,
                      ),
                    })),
                },
              ],
            )
          }
        />
      </Row>
    </Card>
  );
}
export function PantryScreen() {
  const { state, execute, busy } = useKitchen();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [size, setSize] = useState('');
  const [packs, setPacks] = useState('1');
  const [verified, setVerified] = useState(false);
  const [filter, setFilter] = useState('all');
  const batches = state!.batches
    .filter(
      (b) =>
        !b.discarded &&
        b.remaining > 0 &&
        (filter === 'all' ||
          (filter === 'seasoning' && ingredients[b.ingredientId].persistent) ||
          (filter === 'food' && !ingredients[b.ingredientId].persistent)),
    )
    .sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'));
  const matching = Object.values(ingredients)
    .filter((i) =>
      `${i.zh} ${i.en}`.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8);
  return (
    <Page title="我的厨房" subtitle="按购买批次管理，先到期的先用。">
      <Row>
        {[
          ['all', '全部'],
          ['food', '食材'],
          ['seasoning', '调味品'],
        ].map(([id, text]) => (
          <Chip
            key={id}
            label={text}
            selected={filter === id}
            onPress={() => setFilter(id)}
          />
        ))}
      </Row>
      <Button
        title={showAdd ? '收起补录' : '补录家里已有食材'}
        secondary
        onPress={() => setShowAdd((v) => !v)}
      />
      {showAdd && (
        <Card>
          <Field
            label="搜索食材中文或英文名"
            value={search}
            onChangeText={setSearch}
            placeholder="例如 Rice / 大米"
          />
          <Row>
            {matching.map((i) => (
              <Chip
                key={i.id}
                label={`${i.zh} / ${i.en}`}
                selected={ingredientId === i.id}
                onPress={() => setIngredientId(i.id)}
              />
            ))}
          </Row>
          {ingredientId ? (
            <>
              <Field
                label={`每包含量（${ingredients[ingredientId].unit}）`}
                value={size}
                onChangeText={setSize}
                keyboardType="decimal-pad"
              />
              <Field
                label="包数"
                value={packs}
                onChangeText={setPacks}
                keyboardType="number-pad"
              />
              <Chip
                label="已核对包装有效期和储存要求"
                selected={verified}
                onPress={() => setVerified((v) => !v)}
              />
              <Button
                title="确认添加"
                disabled={busy}
                onPress={async () => {
                  const id = uid();
                  if (
                    await execute((s) =>
                      purchase(
                        s,
                        [
                          {
                            ingredientId,
                            size: Number(size),
                            packs: Number(packs),
                            price: null,
                            expiry: null,
                            verified,
                          },
                        ],
                        id,
                      ),
                    )
                  ) {
                    setShowAdd(false);
                    setSize('');
                    setIngredientId('');
                    setVerified(false);
                  }
                }}
              />
            </>
          ) : (
            <Note>请选择一项食材。搜索可查全部 52 项。</Note>
          )}
        </Card>
      )}
      {!batches.length && (
        <Empty text="还没有这类库存。买完后在购物清单确认，或补录家里已有食材。" />
      )}
      {batches.map((batch) => (
        <BatchCard
          key={`${batch.id}:${batch.expiry}:${batch.verified}`}
          batch={batch}
        />
      ))}
      <Note>
        安全核对由你根据包装完成，App
        无法检测实际食品状态。常备调味品也会过期；过期或储存不兼容的批次不会被使用。
      </Note>
    </Page>
  );
}
