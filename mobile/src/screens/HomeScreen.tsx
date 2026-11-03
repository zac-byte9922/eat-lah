import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useKitchen } from '../storage/context';
import { addDays, mealName, planDays, today, usable } from '../domain/kitchen';
import { ingredients, slotNames } from '../domain/catalog';
import { Slot } from '../domain/types';
import {
  Body,
  Button,
  Card,
  Chip,
  Heading,
  Note,
  Page,
  Row,
} from '../components/ui';

export function HomeScreen() {
  const { state: loaded, execute, busy } = useKitchen();
  const state = loaded!;
  const [planner, setPlanner] = useState(false);
  const [days, setDays] = useState(3);
  const date = today();
  const reminders = state.batches.filter(
    (b) =>
      !b.discarded &&
      b.remaining > 0 &&
      (!usable(b, state.profile, date) ||
        (b.expiry && b.expiry <= addDays(date, 2))),
  );
  const meals = state.meals
    .filter((m) => m.date >= date && m.date <= addDays(date, 6))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        ['breakfast', 'lunch', 'dinner'].indexOf(a.slot) -
          ['breakfast', 'lunch', 'dinner'].indexOf(b.slot),
    );
  return (
    <Page title="今天吃哪一顿？" subtitle="选一顿，轻松一点。">
      {(['breakfast', 'lunch', 'dinner'] as Slot[]).map((slot, i) => (
        <Card key={slot}>
          <Heading>
            {['☀', '◐', '☾'][i]} {slotNames[slot]}
          </Heading>
          <Note>{['Breakfast', 'Lunch', 'Dinner'][i]}</Note>
          <Button
            title={
              state.logs.some((l) => l.date === date && l.slot === slot)
                ? `${slotNames[slot]}已打卡 · 查看记录`
                : `选择${slotNames[slot]}`
            }
            onPress={() =>
              state.logs.some((l) => l.date === date && l.slot === slot)
                ? router.push('/history')
                : router.push({ pathname: '/choose', params: { slot } })
            }
          />
        </Card>
      ))}
      {!!reminders.length && (
        <Card>
          <Heading>厨房提醒 · {reminders.length} 批</Heading>
          {reminders.slice(0, 3).map((b) => (
            <Note key={b.id}>
              {ingredients[b.ingredientId].zh} ·{' '}
              {b.expiry && b.expiry < date
                ? '已过期，不能使用'
                : !usable(b, state.profile, date)
                  ? '需核对包装或储存条件'
                  : `临期 ${b.expiry}`}
            </Note>
          ))}
          <Button
            title="查看厨房"
            secondary
            onPress={() => router.push('/pantry')}
          />
        </Card>
      )}
      <Button
        title={planner ? '收起菜单规划' : '安排 3–7 天菜单'}
        secondary
        onPress={() => setPlanner((v) => !v)}
      />
      {planner && (
        <Card>
          <Heading>每一天，少想一点</Heading>
          <Row>
            {[3, 4, 5, 6, 7].map((n) => (
              <Chip
                key={n}
                label={`${n} 天`}
                selected={n === days}
                onPress={() => setDays(n)}
              />
            ))}
          </Row>
          <Note>
            每天安排早午晚三餐的主食。会替换所选天数内未打卡的计划，购物清单随之合并；已打卡记录保留。
          </Note>
          <Button
            title="生成菜单"
            disabled={busy}
            onPress={() =>
              Alert.alert('替换这些天的未完成菜单？', '不会自动入库或打卡。', [
                { text: '取消', style: 'cancel' },
                {
                  text: '生成',
                  onPress: () => execute((s) => planDays(s, days)),
                },
              ])
            }
          />
        </Card>
      )}
      {!!meals.length && <Heading>接下来的安排</Heading>}
      {meals.map((m) => (
        <Card key={m.id}>
          <Note>
            {m.date} · {slotNames[m.slot]}
          </Note>
          <Body>{mealName(m)}</Body>
          {state.logs.some((l) => l.date === m.date && l.slot === m.slot) ? (
            <Note>✓ 已完成</Note>
          ) : (
            <Row>
              <Button
                title={m.date === date ? '查看做法' : '改选这顿'}
                secondary
                onPress={() =>
                  router.push(
                    m.date === date
                      ? { pathname: '/cook', params: { id: m.id } }
                      : {
                          pathname: '/choose',
                          params: { slot: m.slot, date: m.date },
                        },
                  )
                }
              />
              <Button
                title="移除计划"
                secondary
                disabled={busy}
                onPress={() =>
                  execute((s) => ({
                    ...s,
                    meals: s.meals.filter((x) => x.id !== m.id),
                  }))
                }
              />
            </Row>
          )}
        </Card>
      ))}
      <Note>
        提醒显示在 App
        内；此阶段未启用系统推送。所有食谱、营养与烹饪时间均为演示内容。
      </Note>
    </Page>
  );
}
