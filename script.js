const tagColors = [
  '#00ff00',
  '#ff0000',
  '#021aee',
  '#20c0FF',
  '#d602ee',
  '#ffff03',
  '#FF3D00',
  '#40FFFF',
  '#ff0266',
  '#90ee02',
  '#80CBC4',
  '#BCAAA4',
  '#ee6002',
  '#709Ddd',
  '#FFC107',
];

const mixColors = (color1, color2, percent) => {
  const red1 = parseInt(color1[1] + color1[2], 16);
  const green1 = parseInt(color1[3] + color1[4], 16);
  const blue1 = parseInt(color1[5] + color1[6], 16);

  const red2 = parseInt(color2[1] + color2[2], 16);
  const green2 = parseInt(color2[3] + color2[4], 16);
  const blue2 = parseInt(color2[5] + color2[6], 16);

  const red = Math.round(mix(red1, red2, percent));
  const green = Math.round(mix(green1, green2, percent));
  const blue = Math.round(mix(blue1, blue2, percent));

  const r = red.toString(16).padStart(2, '0');
  const g = green.toString(16).padStart(2, '0');
  const b = blue.toString(16).padStart(2, '0');
  return '#' + r + g + b;
};

const mix = (start, end, percent) => {
  return start + percent * (end - start);
};

/**
 * Returns all elements with classname "tag" and groups them in a Map by their common text.
 */
const findTagGroups = () => {
  const tags = document.getElementsByClassName('tag');

  const groupedTags = new Map();
  for (let tag of tags) {
    const text = tag.innerText;
    if (!groupedTags.has(text)) {
      groupedTags.set(text, []);
    }
    groupedTags.set(text, [...groupedTags.get(text), tag]);
  }

  // Order map alphabetically so that duplicate colors are less likely to be adjacent
  return new Map([...groupedTags.entries()].sort());
};

const activeTags = [];

const handleMouseOverTag = (tags, color) => () => {
  for (const tag of tags) {
    if (!activeTags.includes(tag)) {
      tag.style.borderColor = mixColors(color, '#000000', 0.4);
      tag.style.backgroundColor = mixColors(color, '#000000', 0.7);
      tag.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#000000', 0.6)}`;
    }
  }
};

const resetTagStyle = (tag) => {
  tag.style.borderColor = null;
  tag.style.backgroundColor = null;
  tag.style.boxShadow = null;
  tag.style.color = null;
};

const handleMouseOutTag = (tags) => () => {
  for (const tag of tags) {
    if (!activeTags.includes(tag)) {
      resetTagStyle(tag);
    }
  }
};

const handleClickTag = (tags, color) => () => {
  for (const tag of tags) {
    const index = activeTags.indexOf(tag);
    if (index > -1) {
      activeTags.splice(index, 1);
      resetTagStyle(tag);
    } else {
      activeTags.push(tag);
      tag.style.color = 'white';
      tag.style.borderColor = mixColors(color, '#000000', 0.3);
      tag.style.backgroundColor = mixColors(color, '#000000', 0.6);
      tag.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#000000', 0.4)}`;
    }
  }
};

const initTagHighlighting = () => {
  const groupedTags = findTagGroups().values();
  let i = 0;
  for (const tagGroup of groupedTags) {
    for (const tag of tagGroup) {
      tag.addEventListener(
        'mouseover',
        handleMouseOverTag(tagGroup, tagColors[i % tagColors.length])
      );
      tag.addEventListener('mouseout', handleMouseOutTag(tagGroup));
      tag.addEventListener('click', handleClickTag(tagGroup, tagColors[i % tagColors.length]));
    }
    i++;
  }
};

/**
 * Makes the navbar sticky once the browser scrolls below the original navbar position.
 *
 * The navbar remains sticky for the entire session for easier navigation, even on the homepage.
 */
const initNavbarStickiness = () => {
  const navbar = document.getElementById('navbar');
  let offset = navbar.offsetTop;

  const positionNavbar = () => {
    if (window.pageYOffset >= offset) {
      navbar.classList.add('nav--sticky');

      // The sticky navbar changes the layout in various places, so we're adding
      // a class to the <body> so that these changes can be controlled in CSS.
      document.querySelector('body').classList.add('sticky-nav');
    }
  };

  window.addEventListener('resize', () => {
    offset = navbar.offsetTop;
  });

  window.addEventListener('scroll', positionNavbar);

  positionNavbar(); // Necessary on refresh with an anchor in the url
};

const getNavbarPages = () => {
  const navbar = document.getElementById('navbar');
  const navLinks = Array.from(navbar.getElementsByTagName('a'));
  const pages = [];

  for (const navLink of navLinks) {
    const anchor = navLink.getAttribute('href').replace('#', '');
    const targetElement = document.getElementById(anchor);
    pages.push({ navLink, targetElement });
  }
  return pages.reverse(); // Detection algorithm works in reverse
};

let scrollingTo = null;
let scrollingFrom = null;

/**
 * Changes the navbar styling when clicking or scrolling through the page.
 */
const initNavbarActive = () => {
  const pages = getNavbarPages();
  const navLinks = pages.map(({ navLink }) => navLink);

  const getCurrentPage = () => {
    const navbarHeight = document.getElementById('navbar').offsetHeight;
    return pages.find(({ targetElement }) => {
      return targetElement.getBoundingClientRect().top <= navbarHeight;
    });
  };

  const resetActive = () => {
    navLinks.forEach((link) => link.classList.remove('nav__link--active'));
  };

  /**
   * Upon click mark link as active and keep track of which element we're scrolling
   * to. Until smooth scrolling has finished we want to keep the nav link active.
   */
  const handleClick = (page) => () => {
    resetActive();
    page.navLink.classList.add('nav__link--active');
    scrollingFrom = getCurrentPage();
    scrollingTo = page;
  };

  /**
   * Marks nav link as active if user scrolled it into view unless the user has
   * clicked on one of the nav links.
   */
  const handleScroll = () => {
    const currentPage = getCurrentPage();

    if (scrollingTo && Math.abs(scrollingTo.targetElement.getBoundingClientRect().top) <= 10) {
      scrollingFrom = null;
      scrollingTo = null; // Smooth scrolling after click has finished
    }

    if (!scrollingTo) {
      resetActive();
      if (currentPage) {
        currentPage.navLink.classList.add('nav__link--active');
      }
    }
  };

  /**
   * Adds scroll and click handlers for dynamic navbar styling.
   */
  const registerEventHandlers = () => {
    for (const page of pages) {
      page.navLink.addEventListener('click', handleClick(page));
    }
    window.addEventListener('scroll', handleScroll);
  };

  registerEventHandlers();
  handleScroll(); // Call function if user opened page with an anchor
};

/**
 * Moves the navbar element horizontally while scrolling
 */
const initNavbarHorizontalMotion = () => {
  const pages = getNavbarPages();

  const handleScroll = () => {
    let currentPage = null;
    let i = -1;
    const navbarHeight = document.getElementById('navbar').offsetHeight;

    if (scrollingTo) {
      currentPage = scrollingFrom;
    } else {
      while (!currentPage && i < pages.length - 1) {
        i++;
        if (pages[i].targetElement.getBoundingClientRect().top <= navbarHeight) {
          currentPage = pages[i];
        }
      }
    }

    const currentPageOffset = currentPage
      ? parseInt(currentPage.navLink.getAttribute('data-offset'))
      : 0;

    // Don't change offset when we've reached the last page
    if (i === 0) {
      document.querySelector('.navbar__content').style.left = `${currentPageOffset}rem`;
      return;
    }

    // Determine distance we have to travel between this page and the next
    // If currentPage is null we're on the homepage (which cannot be navigated to as a navlink)
    let nextPage = currentPage ? pages[i - 1] : pages[i];
    if (scrollingTo) {
      nextPage = scrollingTo;
    }
    const nextPageOffset = parseInt(nextPage.navLink.getAttribute('data-offset'));
    const distance = nextPageOffset - currentPageOffset;

    // Determine the progress how much of the distance has been traveled
    const currentPageTop = currentPage
      ? currentPage.targetElement.getBoundingClientRect().top
      : -window.scrollY;
    const nextPageTop = nextPage.targetElement.getBoundingClientRect().top;
    const totalHeight = Math.abs(nextPageTop - currentPageTop);
    const progress = Math.abs(currentPageTop) / totalHeight;

    const newOffset = `${currentPageOffset + progress * distance}rem`;
    document.querySelector('.navbar__content').style.left = newOffset;
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();
};

const scrollDownArrow = () => {
  // timeout necessary for FF and Safari
  setTimeout(() => {
    window.scrollTo({ top: window.innerHeight, left: 0 });
  }, 5);
};

window.onload = () => {
  initTagHighlighting();
  initNavbarStickiness();
  initNavbarActive();
  initNavbarHorizontalMotion();
};
