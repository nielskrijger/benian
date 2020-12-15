const scrollDownArrow = () => {
  // timeout necessary for FF and Safari to fix issue with innerHeight not set yet
  setTimeout(() => {
    window.scrollTo({ top: window.innerHeight, left: 0 });
  }, 5);
};

const initDownArrowTransparency = () => {
  const downArrow = document.querySelector('.homepage__down-arrow');
  window.addEventListener('scroll', () => {
    const progress = Math.min(1, window.pageYOffset / 200);
    downArrow.style.opacity = `${1 - progress}`;
  });
};

window.addEventListener('load', () => {
  initDownArrowTransparency();
});
