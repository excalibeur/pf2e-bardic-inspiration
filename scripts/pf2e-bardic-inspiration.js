import {registerSettings} from './settings.js';
import {renderTokenHUD} from './token-hud-controller.js';

Hooks.once('init', async function() {
	console.log('pf2e-bardic-inspiration | Initializing Pathfinder 2E Bardic Inspiration');
	registerSettings();
});


Hooks.on('renderTokenHUD', (hud, html, token) => renderTokenHUD(hud, html, token));