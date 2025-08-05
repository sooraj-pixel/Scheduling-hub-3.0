// components/ui/index.js

export { default as Button   } from './button'
export { default as Input    } from './input'
// we don’t have a dedicated <Table> component, so let’s assume you want your sheet.jsx
// to be the table. Rename “sheet” to “Table” if you like, or re-export:
export { default as Table    } from './sheet'
export { default as Modal    } from './dialog'
export { default as Checkbox } from './checkbox'

