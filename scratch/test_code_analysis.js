function countCppCin(code) {
  const matches = code.match(/>>\s*[a-zA-Z0-9_\[\]]+/g);
  return matches ? matches.length : 0;
}

console.log('cin >> a >> b:', countCppCin('cin >> a >> b;'));
console.log('cin >> x:', countCppCin('cin >> x;'));
