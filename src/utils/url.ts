const encodeQueryParam = (param: string) =>
  encodeURIComponent(param).replace(/%20/g, "+");

const decodeQueryParam = (param: string) =>
  decodeURIComponent(param.replace("+", " "));

const encodePathParam = (param: string) =>
  encodeURIComponent(
    param.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"),
  );

const decodePathParam = (param: string) => {
  const convertToTitleCase = (string: string) => {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return convertToTitleCase(
    decodeURIComponent(param.replace(/-/g, " ").replace(/and/g, "&")),
  );
};

export { encodeQueryParam, decodeQueryParam, encodePathParam, decodePathParam };
