import type { CorePack } from '../../packs'

export default {
  suggestions: '建议',
  location: '当前位置',
  selectionUnavailable: '不在当前选项中',
  entriesNotLoaded: '尚未加载选项。',
  entriesLoading: '正在加载选项…',
  entriesUpdating: '正在更新建议…',
  entriesEmpty: '暂无可用选项。',
  suggestionsEmpty: '没有匹配项。',
  entriesFailed: '无法加载选项。',
} satisfies CorePack<'entries'>
