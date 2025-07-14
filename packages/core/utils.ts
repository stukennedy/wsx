export const html = (strings: TemplateStringsArray, ...values: any[]) =>
  strings.reduce((result, str, i) => result + str + (values[i] || ""), "");
