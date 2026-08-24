import { defineType, defineField, defineArrayMember } from 'sanity'
import { SplitHorizontalIcon } from '@sanity/icons/SplitHorizontal'

/**
 * A chain of steps, dropped into a write-up.
 *
 * Every case study on this site has one: 用户需求 → PRD → 信息架构 → …, 报名 → 匹配 →
 * 组局 → …, 比赛同步 → 自动结算 → 排行榜更新. Written as a sentence it is a line of
 * arrows that wraps into nonsense on a phone; written as this it is a row of chips
 * the eye can follow, and the arrows belong to the code rather than being typed.
 *
 * `set` is the same thing without the arrows, for a group that has no order —
 * Student / Teacher / Course / Classroom is a list of objects, not a sequence.
 *
 * The steps are plain strings rather than bilingual pairs: this block only ever sits
 * inside a write-up that is already one language, and the Chinese chain belongs in
 * the Chinese write-up next to the paragraph that introduces it.
 */
export const flowSteps = defineType({
  name: 'flowSteps',
  title: 'Step chain',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'The small gold line above the chain. Optional.',
      type: 'string',
    }),
    defineField({
      name: 'variant',
      title: 'Shape',
      type: 'string',
      options: {
        list: [
          { title: 'Chain — steps in order, joined by arrows', value: 'chain' },
          { title: 'Set — a group with no order', value: 'set' },
        ],
        layout: 'radio',
      },
      initialValue: 'chain',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(2),
    }),
  ],
  preview: {
    select: { label: 'label', steps: 'steps', variant: 'variant' },
    prepare({ label, steps, variant }) {
      const names = ((steps ?? []) as string[]).filter(Boolean)
      return {
        title: names.join(variant === 'set' ? ' · ' : ' → ') || 'Empty chain',
        subtitle: label ?? 'Step chain',
      }
    },
  },
})
