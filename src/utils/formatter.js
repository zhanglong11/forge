const formatterColumns = (list, value) =>
  list.find(item => item.value === value) ? list.find(item => item.value === value).label : '其他'

export { formatterColumns }
