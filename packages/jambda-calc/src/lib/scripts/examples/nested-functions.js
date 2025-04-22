// eslint-disable-next-line
function wrapperFunc(b) {
  const result = times3(b);
  return result + 1;
}

function times3(a) {
  return a * 3;
}
