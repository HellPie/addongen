/**
 * A small modification to the MaterialTooltip (mdl-tooltip)
 * MDL Element to make it do what I want it to do. :D
 *
 * Tries to fix the missing mdl-tooltip--big code.
 */

/**
 * @disclaimer:
 * This work is a almost a perfect clone of Google Inc's
 * Material Design Lite "MaterialTooltip". Follows a copy
 * of the original License.
 *
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Class constructor for Tooltip component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @param {HTMLElement} element The element that will be upgraded.
 */

var MaterialTooltipBig = function MaterialTooltipBig(element) {
	this.element_ = element;
	this.lastEvent_ = null;
	this.lastContent_ = "";
	this.compact_ = 0;

	// Initialize instance.
	this.init();
};

window.MaterialTooltipBig = MaterialTooltipBig;

/**
 * Store constants in one place so they can be updated easily.
 *
 * @enum {String | Number}
 * @private
 */
MaterialTooltipBig.prototype.Constant_ = {};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {String}
 * @private
 */
MaterialTooltipBig.prototype.CssClasses_ = { IS_ACTIVE: 'is-active' };

/**
 * Handle mouseenter for tooltip.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTooltipBig.prototype.handleMouseEnter_ = function (event) {
	event.stopPropagation();
	this.lastEvent_ = event;
	var props = event.target.getBoundingClientRect();
	var left = props.left;
	this.element_.style.margin = '-60px';
	var marginLeft = -1 * (this.element_.offsetWidth ) - 16;
	if (left + marginLeft < 0) {
		this.element_.style.left = 0;
		this.element_.style.marginLeft = 0;
	} else {
		this.element_.style.left = left + 'px';
		this.element_.style.marginLeft = marginLeft + 'px';
	}
	this.element_.style.top = props.top + props.height + 10 + 'px';
	this.element_.classList.add(this.CssClasses_.IS_ACTIVE);
	window.addEventListener('scroll', this.boundMouseLeaveHandler, false);
	window.addEventListener('touchmove', this.boundMouseLeaveHandler, false);
};

/**
 * Handle mouseleave for tooltip.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTooltipBig.prototype.handleMouseLeave_ = function (event) {
	event.stopPropagation();
	this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);
	window.removeEventListener('scroll', this.boundMouseLeaveHandler);
	window.removeEventListener('touchmove', this.boundMouseLeaveHandler, false);
};

/**
 * Initialize element.
 */
MaterialTooltipBig.prototype.init = function () {
	if (this.element_) {
		var forElId = this.element_.getAttribute('for');
		if (forElId) {
			this.forElement_ = document.getElementById(forElId);
		}
		if (this.forElement_) {
			// Tabindex needs to be set for `blur` events to be emitted
			if (!this.forElement_.getAttribute('tabindex')) {
				this.forElement_.setAttribute('tabindex', '0');
			}
			this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
			this.boundMouseLeaveHandler = this.handleMouseLeave_.bind(this);
			this.forElement_.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
			this.forElement_.addEventListener('click', this.boundMouseEnterHandler, false);
			this.forElement_.addEventListener('blur', this.boundMouseLeaveHandler);
			this.forElement_.addEventListener('touchstart', this.boundMouseEnterHandler, false);
			this.forElement_.addEventListener('mouseleave', this.boundMouseLeaveHandler);
		}
	}
};

/**
 * Downgrade the component
 *
 * @private
 */
MaterialTooltipBig.prototype.mdlDowngrade_ = function () {
	if (this.forElement_) {
		this.forElement_.removeEventListener('mouseenter', this.boundMouseEnterHandler, false);
		this.forElement_.removeEventListener('click', this.boundMouseEnterHandler, false);
		this.forElement_.removeEventListener('touchstart', this.boundMouseEnterHandler, false);
		this.forElement_.removeEventListener('mouseleave', this.boundMouseLeaveHandler);
	}
};

// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
	constructor: MaterialTooltipBig,
	classAsString: 'MaterialTooltipBig',
	cssClass: 'hellpie-tooltip-big'
});