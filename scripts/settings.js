export const registerSettings = () => {
	// Register any custom module settings here
	game.settings.register('pf2e-bardic-inspiration', 'add-inspiration-buttons', {
        name: 'Add bardic inspiration buttons',
        hint: 'Adds buttons to the token HUD to allow control of bardic inspiration bonuses.',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
};
