import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Share } from 'react-native';
import { useKitchen } from '../storage/context';
import { ingredients, slotNames } from '../domain/catalog';
import {
  mealName,
  purchase,
  shoppingList,
  today,
  uid,
} from '../domain/kitchen';
import { Purchase, ShoppingLine } from '../domain/types';
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
} from '../components/ui';

interface Form {
  selected: boolean;
  size: string;
  packs: string;
  price: string;
  expiry: string;
  verified: boolean;
}
export function ShoppingScreen() {
  const { state: loaded, execute, busy } = useKitchen();
  const state = loaded!;
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const purchaseId = useRef(uid());
  const lines = shoppingList(state);
  const meals = state.meals.filter(
    (m) =>
      m.date === today() &&
      m.kind === 'home' &&
      !state.logs.some((l) => l.date === m.date && l.slot === m.slot),
  );
  const form = (line: ShoppingLine): Form =>
    forms[line.ingredientId] || {
      selected: false,
      size: line.size ? String(line.size) : '',
      packs: '',
      price:
        state.packages[line.ingredientId]?.price == null
          ? ''
          : String(state.packages[line.ingredientId].price),
      expiry: '',
      verified: false,
    };
  const change = (line: ShoppingLine, patch: Partial<Form>) =>
    setForms((v) => ({
      ...v,
      [line.ingredientId]: { ...form(line), ...patch },
    }));
  const confirm = async () => {
    if (saving) return;
    const items: Purchase[] = lines
      .filter((l) => form(l).selected)
      .map((l) => {
        const f = form(l);
        return {
          ingredientId: l.ingredientId,
          size: f.size.trim() ? Number(f.size) : NaN,
          packs: f.packs.trim() ? Number(f.packs) : NaN,
          price: f.price.trim() ? Number(f.price) : null,
          expiry: f.expiry.trim() || null,
          verified: f.verified,
        };
      });
    setSaving(true);
    setError('');
    const id = purchaseId.current;
    const ok = await execute((s) => purchase(s, items, id));
    setSaving(false);
    if (ok) {
      purchaseId.current = uid();
      setForms({});
      setError('已按实际购买数量入库。未核对安全状态的批次请到厨房检查。');
    }
  };
  return (
    <Page title="买菜清单" subtitle="先用家里的，再买缺的。">
      <Note>
        没有接入真实超市 SKU
        或实时价格。请输入手中商品的实际包装数量；价格可留空。计划中的食材不会自动成为库存。
      </Note>
      {!lines.length && (
        <Empty
          text={
            state.meals.length
              ? '当前计划无需补购。请检查库存包装和安全状态后开始做饭。'
              : '还没有购物需求，先从首页选一顿。'
          }
        />
      )}
      {lines.map((line) => {
        const i = ingredients[line.ingredientId],
          f = form(line),
          size = Number(f.size);
        const suggested =
          Number.isFinite(size) && size > 0
            ? Math.ceil(line.missing / size)
            : null;
        return (
          <Card key={i.id}>
            <Heading>{i.zh}</Heading>
            <Note>{i.en}</Note>
            <Body>
              还缺{' '}
              {i.persistent ? '一份常备调味品' : `${line.missing}${i.unit}`}
            </Body>
            <Field
              label={`每包实际含量（${i.unit}）`}
              value={f.size}
              onChangeText={(size) => change(line, { size })}
              keyboardType="decimal-pad"
              placeholder="按包装填写"
            />
            <Note>
              {suggested
                ? `按此包装建议购买 ${suggested} 包；实际包数请在下方确认。`
                : '填写实际含量后，计算整包装购买数量。'}
            </Note>
            <Field
              label="实际买到几包"
              value={f.packs}
              onChangeText={(packs) => change(line, { packs })}
              keyboardType="number-pad"
              placeholder="未买到就不勾选"
            />
            <Field
              label="每包实付价格 S$（选填）"
              value={f.price}
              onChangeText={(price) => change(line, { price })}
              keyboardType="decimal-pad"
              placeholder="未知留空"
            />
            <Field
              label="包装有效期（选填 YYYY-MM-DD）"
              value={f.expiry}
              onChangeText={(expiry) => change(line, { expiry })}
              autoCapitalize="none"
              placeholder="例如 2026-12-31"
            />
            <Chip
              label="已核对包装过敏原、有效期和储存要求"
              selected={f.verified}
              onPress={() => change(line, { verified: !f.verified })}
            />
            <Chip
              label="这件我实际买到了"
              selected={f.selected}
              onPress={() => change(line, { selected: !f.selected })}
            />
          </Card>
        );
      })}
      {!!lines.length && (
        <>
          <Button
            title="确认实际购买并入库"
            disabled={busy || saving}
            onPress={confirm}
          />
          <Button
            title="分享中英文购物清单"
            secondary
            onPress={async () => {
              try {
                await Share.share({
                  message:
                    'Eat Lah · Shopping list\n' +
                    lines
                      .map((l) => {
                        const i = ingredients[l.ingredientId],
                          size = Number(form(l).size);
                        return `${i.zh} / ${i.en} — ${l.missing}${i.unit}${size > 0 ? `; ${Math.ceil(l.missing / size)} pack(s) × ${size}${i.unit}` : '; confirm package size'}`;
                      })
                      .join('\n'),
                });
              } catch {
                setError('无法打开系统分享。');
              }
            }}
          />
        </>
      )}
      {error ? <Body>{error}</Body> : null}
      {meals.map((m) => (
        <Card key={m.id}>
          <Note>{slotNames[m.slot]} · 下一步</Note>
          <Heading>{mealName(m)}</Heading>
          <Button
            title="开始跟着步骤做饭"
            secondary
            onPress={() =>
              router.push({ pathname: '/cook', params: { id: m.id } })
            }
          />
        </Card>
      ))}
      <Button title="返回首页" secondary onPress={() => router.replace('/')} />
    </Page>
  );
}
