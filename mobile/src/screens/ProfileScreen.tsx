import React, { useState } from 'react';
import { router } from 'expo-router';
import { Share, View } from 'react-native';
import { allergens, recipeById, tools } from '../domain/catalog';
import { validateProfile } from '../domain/kitchen';
import { Profile } from '../domain/types';
import { useKitchen } from '../storage/context';
import {
  Body,
  Button,
  Card,
  Chip,
  Field,
  Heading,
  Note,
  Page,
  Row,
} from '../components/ui';

export function ProfileScreen() {
  const { state, execute, busy } = useKitchen();
  const [profile, setProfile] = useState<Profile>(() => ({
    ...state!.profile,
  }));
  const [budget, setBudget] = useState(String(profile.budget));
  const [kcal, setKcal] = useState(String(profile.kcal));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const isSetup = !state!.onboarded;
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));
  const toggle = (key: 'tools' | 'allergens' | 'tastes', id: string) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(id)
        ? p[key].filter((x) => x !== id)
        : [...p[key], id],
    }));
  const save = async () => {
    const next = {
      ...profile,
      budget: budget.trim() ? Number(budget) : NaN,
      kcal: kcal.trim() ? Number(kcal) : NaN,
    };
    try {
      validateProfile(next);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    if (await execute((s) => ({ ...s, profile: next, onboarded: true })))
      router.replace('/');
  };
  return (
    <Page
      title={
        isSetup
          ? [
              '先认识你的厨房',
              '预算与热量参考',
              '吃得合你心意',
              '准备好，开始吃饭',
            ][step]
          : '我的设置'
      }
      subtitle={
        isSetup
          ? `首次使用 ${step + 1} / 4 · 资料只保存在本机`
          : '修改后点击保存，应用到下一次推荐。'
      }
    >
      {(!isSetup || step === 0) && (
        <Card>
          <Field
            label="新加坡邮编（6 位）"
            value={profile.postal}
            onChangeText={(v) =>
              set('postal', v.replace(/\D/g, '').slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
            placeholder="例如 138611"
          />
          <Note>只收集邮编，不需要门牌地址。暂未接入门店搜索或距离排名。</Note>
          <Heading>你有哪些厨具？</Heading>
          <Row>
            {tools.map((t) => (
              <Chip
                key={t.id}
                label={t.zh}
                selected={profile.tools.includes(t.id)}
                onPress={() => toggle('tools', t.id)}
              />
            ))}
          </Row>
          <Heading>储存条件</Heading>
          <Row>
            {(
              [
                ['none', '没有冷藏'],
                ['fridge', '有冷藏'],
                ['freezer', '冷藏 + 冷冻'],
              ] as const
            ).map(([id, text]) => (
              <Chip
                key={id}
                label={text}
                selected={profile.storage === id}
                onPress={() => set('storage', id)}
              />
            ))}
          </Row>
          <Note>
            没有冷藏时不推荐需要冷藏或冷冻的食材；变更设施不会删除原库存，但不适合储存的批次不会参与自动扣减。
          </Note>
        </Card>
      )}
      {(!isSetup || step === 1) && (
        <Card>
          <Heading>每周买菜预算</Heading>
          <Row>
            {[40, 70, 110].map((v) => (
              <Chip
                key={v}
                label={`S$${v}`}
                selected={budget === String(v)}
                onPress={() => setBudget(String(v))}
              />
            ))}
          </Row>
          <Field
            label="每周预算（新元）"
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
          />
          <Note>
            单人自炊预算的示意档位，不是新加坡的统一消费标准。价格未知时不会虚构成本。
          </Note>
          <Heading>单餐热量参考</Heading>
          <Row>
            {[0, 450, 600, 750].map((v) => (
              <Chip
                key={v}
                label={v ? `${v} kcal` : '不限制'}
                selected={kcal === String(v)}
                onPress={() => setKcal(String(v))}
              />
            ))}
          </Row>
          <Field
            label="热量参考（0 表示不限制）"
            value={kcal}
            onChangeText={setKcal}
            keyboardType="number-pad"
          />
          <Note>仅用于排序；演示热量是估算，不是个人营养或减重建议。</Note>
        </Card>
      )}
      {(!isSetup || step === 2) && (
        <Card>
          <Heading>过敏与忌口</Heading>
          <Row>
            {allergens.map((a) => (
              <Chip
                key={a.id}
                label={`${a.zh} / ${a.en}`}
                selected={profile.allergens.includes(a.id)}
                onPress={() => toggle('allergens', a.id)}
              />
            ))}
          </Row>
          <Field
            label="其他不喜欢的食材"
            value={profile.dislikes}
            onChangeText={(v) => set('dislikes', v)}
            placeholder="例如：蘑菇、番茄"
            maxLength={200}
          />
          <Note>
            过敏是硬性过滤。只要设置了过敏项，配料不明的加工食品也会被排除；仍须核对真实包装和交叉接触提示。
          </Note>
          <Heading>平时偏好的味道</Heading>
          <Row>
            {[
              ['savory', '咸香'],
              ['spicy', '辣'],
              ['sweet', '甜'],
              ['light', '清淡'],
            ].map(([id, text]) => (
              <Chip
                key={id}
                label={text}
                selected={profile.tastes.includes(id)}
                onPress={() => toggle('tastes', id)}
              />
            ))}
          </Row>
        </Card>
      )}
      {isSetup && step === 3 && (
        <Card>
          <Heading>从今天这一顿开始</Heading>
          <Body>
            选餐 → 核对买菜清单 → 确认实际购买 → 跟着步骤做饭 → 完成并打卡。
          </Body>
          <Note>
            58
            项演示条目包含主食、配菜、小食和加料，不是已审核的正式食谱库。没有实时超市价格和云账户。
          </Note>
        </Card>
      )}
      {error ? <Body>{error}</Body> : null}
      {isSetup && step < 3 ? (
        <Button
          title="下一步"
          onPress={() => {
            if (step === 0 && !/^\d{6}$/.test(profile.postal)) {
              setError('请填写 6 位邮编。');
              return;
            }
            setError('');
            setStep((n) => n + 1);
          }}
        />
      ) : (
        <Button
          title={isSetup ? '好了，开始吃饭' : '保存设置'}
          disabled={busy}
          onPress={save}
        />
      )}
      {isSetup && step > 0 ? (
        <Button
          title="上一步"
          secondary
          onPress={() => {
            setError('');
            setStep((n) => n - 1);
          }}
        />
      ) : null}
      {!isSetup && (
        <>
          <Button
            title="我的收藏"
            secondary
            onPress={() => setFavoritesOnly((v) => !v)}
          />
          {favoritesOnly &&
            (!state!.favorites.length ? (
              <Note>还没有收藏。在选餐卡片上点收藏。</Note>
            ) : (
              state!.favorites.map((id) => (
                <Card key={id}>
                  <Heading>
                    {recipeById[id].emoji} {recipeById[id].zh}
                  </Heading>
                  <Note>{recipeById[id].en}</Note>
                  <Button
                    title="移出收藏"
                    secondary
                    onPress={() =>
                      execute((s) => ({
                        ...s,
                        favorites: s.favorites.filter((x) => x !== id),
                      }))
                    }
                  />
                </Card>
              ))
            ))}
          <Button
            title="导出本机资料备份"
            secondary
            onPress={async () => {
              try {
                await Share.share({
                  message: JSON.stringify(state, null, 2),
                  title: 'Eat Lah 本机资料备份',
                });
              } catch {
                setError('无法打开系统分享，请稍后重试。');
              }
            }}
          />
          <View>
            <Note>
              本机资料包含邮编和饮食信息，请自行选择可信的备份位置。卸载 App
              或清除应用数据会丢失本地记录。云同步和导入恢复将在后续实现。
            </Note>
          </View>
        </>
      )}
    </Page>
  );
}
