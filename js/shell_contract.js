/**
 * Bible100 Shell Contract Guard
 * Enforce runtime contract for module index pages:
 * topbar -> sidebar -> content iframe.
 */
(function (global) {
  "use strict";

  function $(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      return null;
    }
  }

  function hasTopbar() {
    return !!(
      $(".topbar") ||
      $(".shell-toolbar") ||
      $("#topWrap")
    );
  }

  function hasSidebarFrame() {
    return !!(
      $("#sidebarFrame") ||
      $('iframe[name="sidebarFrame"]')
    );
  }

  function hasContentFrame() {
    return !!(
      $("#contentFrame") ||
      $('iframe[name="contentFrame"]')
    );
  }

  function validate(pageName) {
    var result = {
      page: pageName || (location && location.pathname ? location.pathname : "unknown"),
      topbar: hasTopbar(),
      sidebarFrame: hasSidebarFrame(),
      contentFrame: hasContentFrame()
    };
    result.ok = !!(result.topbar && result.sidebarFrame && result.contentFrame);
    if (!result.ok) {
      console.warn("[ShellContract] layout mismatch:", result);
    } else {
      console.log("[ShellContract] layout ok:", result.page);
    }
    return result;
  }

  global.B100ShellContract = {
    validate: validate
  };
})(typeof window !== "undefined" ? window : this);

