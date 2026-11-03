import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useKitchen } from '../storage/context';
import {
  available,
  completeMeal,
  mealName,
  requirements,
  today,
} from '../domain/kitchen';
import { ingredients, recipeById, slotNames } from '../domain/catalog';
import {
  Body,
  Button,
  Card,
  Empty,
  Heading,
  Note,
  Page,
  Row,
} from '../components/ui';

export function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state: loaded, execute, busy } = useKitchen();
  const state = loaded!;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const meal = state.meals.find((m) => m.id === id && m.kind === 'home');
  if (!meal)
    return (
      <Page title="先选一顿饭">
        <Empty text="找不到这份菜单，可能已被更换或移除。" />
        <Button title="返回首页" onPress={() => router.replace('/')} />
      </Page>
    );
  const missing = Object.entries(requirements(meal.recipeIds)).filter(
    ([key, q]) => available(state, key, meal.date) < q,
  );
  const steps = meal.recipeIds.flatMap((key) =>
    recipeById[key].steps.map((text) => ({ recipe: recipeById[key], text })),
  );
  const current = steps[Math.min(step, steps.length - 1)];
  const completed = state.logs.some(
    (l) => l.date === meal.date && l.slot === meal.slot,
  );
  return (
    <Page
      title={`${slotNames[meal.slot]} · 开始做饭`}
      subtitle={mealName(meal)}
    >
      <Note>
        原创演示指导，尚未厨房实测。处理前确认包装、设备、用水量和加热要求；加工食品严格以该商品说明为准。
      </Note>
      {!!missing.length && (
        <Card>
          <Heading>先补齐或核对食材</Heading>
          {missing.map(([key]) => (
            <Note key={key}>
              {ingredients[key].zh} / {ingredients[key].en}
            </Note>
          ))}
          <Button
            title="查看购物清单"
            secondary
            onPress={() => router.push('/shopping')}
          />
          <Button
            title="检查家里库存"
            secondary
            onPress={() => router.push('/pantry')}
          />
        </Card>
      )}
      {current && (
        <Card>
          <Note>
            步骤 {step + 1} / {steps.length} · {current.recipe.zh}
          </Note>
          <Heading>{current.text}</Heading>
          {!!current.recipe.tip && <Note>{current.recipe.tip}</Note>}
          <Row>
            <Button
              title="上一步"
              secondary
              disabled={step === 0}
              onPress={() => setStep((n) => n - 1)}
            />
            <Button
              title="下一步"
              disabled={step === steps.length - 1}
              onPress={() => setStep((n) => Math.min(n + 1, steps.length - 1))}
            />
          </Row>
        </Card>
      )}
      <Card>
        <Heading>这顿用量</Heading>
        {Object.entries(requirements(meal.recipeIds)).map(([key, q]) => (
          <Body key={key}>
            {ingredients[key].zh} / {ingredients[key].en} ·{' '}
            {ingredients[key].persistent
              ? '常备'
              : `${q}${ingredients[key].unit}`}
          </Body>
        ))}
        <Note>
          熟食与生食分开处理；鸡肉用食品温度计确认中心至少
          75°C，蛋液充分凝固。此提醒不能替代具体商品与设备说明。
        </Note>
      </Card>
      {meal.date !== today() && (
        <Note>这是 {meal.date} 的计划，只能在当天完成打卡。</Note>
      )}
      <Button
        title={completed ? '这顿已完成' : '完成这顿 · 打卡并扣库存'}
        disabled={
          busy ||
          saving ||
          completed ||
          !!missing.length ||
          meal.date !== today() ||
          step < steps.length - 1
        }
        onPress={async () => {
          if (saving) return;
          setSaving(true);
          const ok = await execute((s) => completeMeal(s, meal));
          setSaving(false);
          if (ok) router.replace('/history');
        }}
      />
      <Button title="返回首页" secondary onPress={() => router.replace('/')} />
    </Page>
  );
}
