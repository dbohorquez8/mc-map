import { trim, is } from 'ramda';

const labellingStyleOverride = {
  normal: 0,
  suppress: 1,
  always: 2,
};

function SuppressableLabel(text, styleOverride) {
  this.text = text;

  if (styleOverride === undefined) {
    this.displayOverride = labellingStyleOverride.normal;
  } else {
    this.displayOverride = styleOverride;
  }
  this.suppress = this.displayOverride === labellingStyleOverride.suppress;
  this.always = this.displayOverride === labellingStyleOverride.always;
}

SuppressableLabel.prototype.toString = () => this.text;
SuppressableLabel.parse = (markedupLabel) => {
  let result = new SuppressableLabel(markedupLabel);
  const cLabelDontDrawChar = '~';
  const cLabelAlwaysDrawChar = '!';

  if (is(String, markedupLabel)) {
    const trimLabelStr = trim(markedupLabel);
    const firstChar = trimLabelStr[0];
    const lastChar = trimLabelStr[trimLabelStr.length - 1];
    let style = null;

    if (trimLabelStr.length >= 2) {
      const hasTilde =
        firstChar === cLabelDontDrawChar &&
        lastChar === cLabelDontDrawChar;
      const hasExclamation =
        firstChar === cLabelAlwaysDrawChar &&
        lastChar === cLabelAlwaysDrawChar;

      if (hasTilde) {
        style = labellingStyleOverride.suppress;
      } else if (hasExclamation) {
        style = labellingStyleOverride.always;
      }

      if (style) {
        result = new SuppressableLabel(
          trimLabelStr.substring(1, trimLabelStr.length - 1),
          style
        );
      }
    }
  }
  return result;
};

export default SuppressableLabel;
