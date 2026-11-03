import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useKitchen } from '../storage/context';
import {
  available,
  calorieEstimate,
  completeMeal,
  eligible,
  recommend,
  requirements,
  saveMeal,
  today,
  uid,
  validDate,
} from '../domain/kitchen';
import {
  ingredients,
  moodNames,
  recipeById,
  slotNames,
} from '../domain/catalog';
import { Category, Mood, Slot } from '../domain/types';
import {
  Body,
  Button,
  Card,
  Chip,
  Empty,
  Heading,
  Note,
  Page,
  Row,
} from '../components/ui';
import { SwipeCard } from '../components/SwipeCard';

type Step =
  | 'effort'
  | 'mood'
  | 'lazytype'
  | 'base'
  | 'dish'
  | 'snack'
  | 'summary'
  | 'outside'
  | 'delivery';
export function ChooseScreen() {
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const slot = params.slot as Slot;
  const date = params.date || today();
  const { state: loaded, execute, busy } = useKitchen();
  const state = loaded!;
  const [step, setStep] = useState<Step>('effort');
  const [easy, setEasy] = useState(false);
  const [mood, setMood] = useState<Mood>('normal');
  const [selected, setSelected] = useState<Partial<Record<Category, string>>>(
    {},
  );
  const [addons, setAddons] = useState<string[]>([]);
  const [rejected, setRejected] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  if (
    !['breakfast', 'lunch', 'dinner'].includes(slot) ||
    !validDate(date) ||
    date < today()
  )
    return (
      <Page title="先选一个餐次">
        <Empty text="餐次或日期无效，请从首页重新开始。" />
        <Button title="返回首页" onPress={() => router.replace('/')} />
      </Page>
    );
  const category = ['base', 'dish', 'snack'].includes(step)
    ? (step as Category)
    : null;
  const candidates = category
    ? recommend(
        state,
        category,
        slot,
        mood,
        easy && category === 'base',
        date,
      ).filter((r) => !rejected[step]?.includes(r.id))
    : [];
  const card = candidates[0];
  const ids = [selected.base, selected.dish, selected.snack, ...addons].filter(
    (x): x is string => !!x,
  );
  const accept = () => {
    if (!category || !card || saving) return;
    setSelected((v) => ({ ...v, [category]: card.id }));
    setStep(
      category === 'base'
        ? easy
          ? 'summary'
          : 'dish'
        : category === 'dish'
          ? 'snack'
          : 'summary',
    );
  };
  const save = async (kind: 'home' | 'outside' | 'delivery') => {
    if (saving) return;
    setSaving(true);
    const meal = {
      id: uid(),
      date,
      slot,
      kind,
      recipeIds: kind === 'home' ? ids : [],
    };
    const ok = await execute((s) => {
      const next = saveMeal(s, meal);
      return kind !== 'home' && date === today()
        ? completeMeal(next, meal)
        : next;
    });
    setSaving(false);
    if (ok)
      router.replace(
        kind === 'home' ? '/shopping' : date === today() ? '/history' : '/',
      );
  };
  const subtitles: Record<Step, string> = {
    effort: '今天想怎么吃？',
    mood: '想吃哪种？',
    lazytype: '这顿怎么解决？',
    base: '选这顿的主食',
    dish: '要搭一道菜吗？',
    snack: '要加一份小食吗？',
    summary: '选好了',
    outside: '出去吃',
    delivery: '点外卖',
  };
  return (
    <Page title={`${slotNames[slot]} · ${subtitles[step]}`} subtitle={date}>
      {step === 'effort' && (
        <>
          <Button
            title="我想做点"
            onPress={() => {
              setEasy(false);
              setStep('mood');
            }}
          />
          <Button
            title="今天省点事"
            secondary
            onPress={() => {
              setEasy(true);
              setStep('lazytype');
            }}
          />
        </>
      )}
      {step === 'mood' &&
        (Object.entries(moodNames) as [Mood, string][]).map(([id, label]) => (
          <Button
            key={id}
            title={label}
            secondary
            onPress={() => {
              setMood(id);
              if (id === 'surprise') {
                const first = recommend(
                  state,
                  'base',
                  slot,
                  id,
                  false,
                  date,
                )[0];
                if (first) {
                  setSelected({ base: first.id });
                  setStep('summary');
                } else setStep('base');
              } else setStep('base');
            }}
          />
        ))}
      {step === 'lazytype' && (
        <>
          <Button title="在家吃" onPress={() => setStep('base')} />
          <Button title="出去吃" secondary onPress={() => setStep('outside')} />
          <Button
            title="点外卖"
            secondary
            onPress={() => setStep('delivery')}
          />
        </>
      )}
      {(step === 'outside' || step === 'delivery') && (
        <Card>
          <Body>在外吃也算好好吃饭。</Body>
          <Note>
            暂未接入餐厅、配送或交易接口；这里只记录你的选择，不扣家里库存。
          </Note>
          <Button
            title={date === today() ? '这顿吃好了，记录一下' : '保存这顿安排'}
            disabled={busy || saving}
            onPress={() => save(step)}
          />
        </Card>
      )}
      {category && (
        <>
          {card ? (
            <>
              <SwipeCard
                key={card.id}
                recipe={card}
                onAccept={accept}
                onReject={() =>
                  setRejected((v) => ({
                    ...v,
                    [step]: [...(v[step] || []), card.id],
                  }))
                }
                favorite={state.favorites.includes(card.id)}
                onFavorite={() =>
                  execute((s) => ({
                    ...s,
                    favorites: s.favorites.includes(card.id)
                      ? s.favorites.filter((id) => id !== card.id)
                      : [...s.favorites, card.id],
                  }))
                }
              />
              <Card>
                <Heading>需要的食材</Heading>
                {Object.entries(card.ingredients).map(([id, q]) => (
                  <Note key={id}>
                    {ingredients[id].zh} / {ingredients[id].en} ·{' '}
                    {ingredients[id].persistent
                      ? '常备'
                      : `${q}${ingredients[id].unit}`}{' '}
                    ·{' '}
                    {available(state, id, date) >= q
                      ? '库存够用'
                      : '需补购或核对库存'}
                  </Note>
                ))}
                <Note>
                  约 {calorieEstimate([card.id])} kcal（演示估算） ·
                  以真实包装的过敏原、储存与加热说明为准。
                </Note>
              </Card>
            </>
          ) : (
            <Empty text="没有更多符合当前厨具、储存和忌口的选择。可重看跳过项，或到设置调整；不会自动放宽过敏条件。" />
          )}
          {!!rejected[step]?.length && (
            <Button
              title="撤销上次划走"
              secondary
              onPress={() =>
                setRejected((v) => ({ ...v, [step]: v[step].slice(0, -1) }))
              }
            />
          )}
          {category !== 'base' && (
            <Button
              title="不加，跳过这一步"
              secondary
              onPress={() => {
                setSelected((v) => ({ ...v, [category]: undefined }));
                setStep(category === 'dish' ? 'snack' : 'summary');
              }}
            />
          )}
        </>
      )}
      {step === 'summary' && (
        <Card>
          <Heading>{ids.map((id) => recipeById[id].zh).join(' + ')}</Heading>
          <Note>约 {calorieEstimate(ids)} kcal（演示估算）</Note>
          {!!selected.base && !!recipeById[selected.base].addons.length && (
            <>
              <Heading>可选加料</Heading>
              <Row>
                {recipeById[selected.base].addons
                  .filter((id) => eligible(recipeById[id], state.profile))
                  .map((id) => (
                    <Chip
                      key={id}
                      label={recipeById[id].zh}
                      selected={addons.includes(id)}
                      onPress={() =>
                        setAddons((v) =>
                          v.includes(id)
                            ? v.filter((x) => x !== id)
                            : [...v, id],
                        )
                      }
                    />
                  ))}
              </Row>
            </>
          )}
          {Object.entries(requirements(ids)).map(([id, q]) => (
            <Body key={id}>
              {ingredients[id].zh} / {ingredients[id].en} ·{' '}
              {ingredients[id].persistent
                ? '常备调味品'
                : `${q}${ingredients[id].unit}`}
            </Body>
          ))}
          <Note>
            已有可用库存优先抵扣，尚未确认购买的物品不会入库。可选配菜和小食均可跳过。
          </Note>
          <Button
            title="确认，查看购物清单"
            disabled={busy || saving || !selected.base}
            onPress={() => save('home')}
          />
          <Button
            title="重新选择主食"
            secondary
            onPress={() => {
              setSelected({});
              setAddons([]);
              setStep('base');
            }}
          />
        </Card>
      )}
      {step !== 'effort' && (
        <Button
          title="重选做饭方式"
          secondary
          onPress={() => {
            setStep('effort');
            setSelected({});
            setAddons([]);
            setRejected({});
          }}
        />
      )}
      <Button title="返回首页" secondary onPress={() => router.replace('/')} />
    </Page>
  );
}
