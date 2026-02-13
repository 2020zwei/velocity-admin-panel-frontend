export const optionGenerator = (lable: string, value: string, data: any[] = []) => {
    return data.map((el) => ({ label: el[lable], value: el[value] }))
}