import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useKitchen } from '../storage/context';
import { mealName, today, undoMeal } from '../domain/kitchen';
import { slotNames } from '../domain/catalog';
import { Slot } from '../domain/types';
import {
  Body,
  Button,
  Card,
  Empty,
  Heading,
  Note,
  Page,
} from '../components/ui';

export function HistoryScreen() {
  const { state, execute, busy } = useKitchen();
  return (
    <Page title="今天吃了吗？" subtitle="不要求连续打卡，记下属于你的每一顿。">
      {(['breakfast', 'lunch', 'dinner'] as Slot[]).map((slot) => {
        const log = state!.logs.find(
          (l) => l.date === today() && l.slot === slot,
        );
        return (
          <Card key={slot}>
            <Heading>
              {slotNames[slot]} {log ? '✓' : ''}
            </Heading>
            {log ? (
              <Body>{mealName(log)}</Body>
            ) : (
              <Button
                title={`记录${slotNames[slot]}`}
                secondary
                onPress={() =>
                  router.push({ pathname: '/choose', params: { slot } })
                }
              />
            )}
          </Card>
        );
      })}
      <Heading>做饭与用餐历史</Heading>
      {!state!.logs.length && (
        <Empty text="还没有记录。完成做饭或在外吃饭后，记录你的第一顿。" />
      )}
      {[...state!.logs].reverse().map((log) => (
        <Card key={log.id}>
          <Note>
            {log.date} · {slotNames[log.slot]} ·{' '}
            {log.kind === 'home'
              ? '在家做饭'
              : log.kind === 'outside'
                ? '外食'
                : '外卖'}
          </Note>
          <Heading>{mealName(log)}</Heading>
          <Note>
            {log.consumption.length
              ? `使用 ${log.consumption.length} 个库存批次`
              : '未扣减食材库存'}
          </Note>
          <Button
            title="撤销这次打卡"
            secondary
            disabled={busy}
            onPress={() =>
              Alert.alert(
                '撤销打卡？',
                '食材用量将恢复到原购买批次；已经标记丢弃的批次仍不可用。',
                [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '撤销',
                    onPress: () => execute((s) => undoMeal(s, log.id)),
                  },
                ],
              )
            }
          />
        </Card>
      ))}
    </Page>
  );
}
