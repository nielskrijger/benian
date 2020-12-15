/**
 * Makes the navbar sticky once the browser scrolls below the original navbar position.
 *
 * The navbar remains sticky for the entire session for easier navigation, even
 * on the homepage where it is not shown on first load.
 */
const initNavbarStickiness = () => {
  const navbar = document.getElementById('navbar');
  let offset = navbar.offsetTop;

  const positionNavbar = () => {
    if (window.pageYOffset >= offset) {
      navbar.classList.add('nav--sticky');

      // The sticky navbar changes the layout in various places, so we're adding
      // a class to the <body> to control those changes in CSS.
      document.querySelector('body').classList.add('sticky-nav');
    }
  };

  window.addEventListener('resize', () => {
    offset = navbar.offsetTop;
  });

  window.addEventListener('scroll', positionNavbar);

  positionNavbar(); // Necessary on refresh with an anchor in the url
};

/**
 * Returns an array of navLinks and their associated content page.
 */
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

/**
 * This class tracks when the browser is scrolling after clicking one of the
 * navigation links.
 *
 * Due to "scroll-behaviour: smooth" scrolling takes a while and other effects
 * need to sync-up with this motion.
 */
class ScrollMotion {
  constructor() {
    this.scrollingFrom = null;
    this.scrollingTo = null;
  }

  setScrolling(scrollingFrom, scrollingTo) {
    this.scrollingFrom = scrollingFrom;
    this.scrollingTo = scrollingTo;
  }

  isScrolling() {
    return this.scrollingTo !== null;
  }

  updateScrollStatus() {
    if (
      this.isScrolling() &&
      Math.abs(this.scrollingTo.targetElement.getBoundingClientRect().top) <= 10
    ) {
      this.scrollingFrom = null;
      this.scrollingTo = null;
    }
  }
}

const scrollMotion = new ScrollMotion();

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
    scrollMotion.setScrolling(getCurrentPage(), page);
  };

  /**
   * Marks nav link as active if user scrolled it into view unless the user has
   * clicked on one of the nav links.
   */
  const handleScroll = () => {
    scrollMotion.updateScrollStatus();
    const currentPage = getCurrentPage();
    if (!scrollMotion.isScrolling()) {
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
 * Returns the current and nextPage. If the app is in the process of scrolling
 * returns the origin and target pages instead.
 *
 * Returns nextPage = null when reading the last page.
 */
const getCurrentAndNextPage = (pages) => {
  if (scrollMotion.isScrolling()) {
    return {
      currentPage: scrollMotion.scrollingFrom,
      nextPage: scrollMotion.scrollingTo,
    };
  }

  let currentPage = null;
  let i = -1;

  while (!currentPage && i < pages.length - 1) {
    i++;
    if (pages[i].targetElement.getBoundingClientRect().top <= 0) {
      currentPage = pages[i];
    }
  }

  if (!currentPage) {
    throw new Error('Unable to find current page');
  }

  return {
    currentPage,
    nextPage: currentPage ? pages[i - 1] : pages[i],
  };
};

/**
 * Moves the navbar element horizontally while scrolling
 */
const initNavbarHorizontalMotion = () => {
  const pages = getNavbarPages();

  const handleScroll = () => {
    const { currentPage, nextPage } = getCurrentAndNextPage(pages);

    const currentPageOffset = parseInt(currentPage.navLink.getAttribute('data-offset'));

    // Don't change offset when we've reached the last page
    if (nextPage === null) {
      document.querySelector('.navbar__content').style.left = `${currentPageOffset}rem`;
      return;
    }

    // Determine distance we have to travel between this page and the next
    // If currentPage is null we're on the homepage (which cannot be navigated to as a navlink)
    const nextPageOffset = parseInt(nextPage.navLink.getAttribute('data-offset'));
    const distance = nextPageOffset - currentPageOffset;

    // Determine the progress how much of the distance has been traveled
    const currentPageTop = currentPage.targetElement.getBoundingClientRect().top;
    const nextPageTop = nextPage.targetElement.getBoundingClientRect().top;
    const totalHeight = Math.abs(nextPageTop - currentPageTop);
    const progress = Math.abs(currentPageTop) / totalHeight;

    const newOffset = `${currentPageOffset + progress * distance}rem`;
    document.querySelector('.navbar__content').style.left = newOffset;
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();
};

window.addEventListener('load', () => {
  initNavbarStickiness();
  initNavbarActive();
  initNavbarHorizontalMotion();
});
