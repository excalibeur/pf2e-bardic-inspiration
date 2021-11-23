const inspireCourageEffectName = "Inspire Courage"
const inspireHeroicsEffectName = "Inspire Heroics (Courage, +2)";
const inspireHeroicsCriticalEffectName = "Inspire Heroics (Courage, +3)";

const effectIdAttribute = '_effect-id';
const exclusiveEffects = [
    // Keep all 3 inspire courage effects exclusive to each other.
    [inspireCourageEffectName, inspireHeroicsEffectName, inspireHeroicsCriticalEffectName]
];


const getSpell = async (spell) => {
    const spellEffectPack = game.packs.get('pf2e.spell-effects');
    await spellEffectPack.getIndex();
    const spellEntry = spellEffectPack.index.find(e => e.name.includes(spell));
    return await spellEffectPack.getDocument(spellEntry._id);
}

const getSpellEffectFromActor = (actor, spell) => {
    return (actor.data).items.filter(item => item.name.includes(spell) && item.type === 'effect');
}

const tokenButtonHandler = async (event, actor, token) => {
    const btn = $(event.currentTarget);
    btn.toggleClass('active');
    btn.find("div.status-effects").toggleClass('active');
};

const removeEffect = (effectName, actor) => {
    const effect = getSpellEffectFromActor(actor, effectName);
    if (effect.length) {
        actor.deleteEmbeddedDocuments('Item', effect.map(i => i.id));
    }
}

const mouseoverHandler = async (event) => {
    const statusDescr = $("div.status-effect-summary")
    statusDescr.text($(event.currentTarget)[0].title).toggleClass("active");
}

const updateHUD = async (html, actor) => {
    const $statusIcons = html.find("img.control-icon");
    for (const icon of $statusIcons) {
        const $icon = $(icon);
        const effectName = $icon.attr(effectIdAttribute);
        const effect = getSpellEffectFromActor(actor, effectName);
        if (effect.length) {
            $icon.addClass('active');
        } else {
            $icon.removeClass('active');
        }
    }
}

const effectButtonHandler = async (event, actor) => {
    const btn = $(event.currentTarget);
    const effectName = btn[0].attributes[effectIdAttribute].value;
    const effectItem = await getSpell(effectName);
    const effect = getSpellEffectFromActor(actor, effectName);
    const hud = btn.parent();
    if (effect.length) {
        removeEffect(effectName, actor);
    } else {
        // Remove exclusive effects first
        for (var i = 0; i < exclusiveEffects.length; i++) {
            const exclusiveSet = exclusiveEffects[i];
            if (exclusiveSet.includes(effectName)) {
                for (var j = 0; j < exclusiveSet.length; j++) {
                    removeEffect(exclusiveSet[j], actor);
                }
                break;
            }
        }
        const effects = await actor.createEmbeddedDocuments('Item', [effectItem.data]);
        const effect = effects.find(e => e.data.name === effectItem.data.name);
        const update = { _id: effect.data._id, data: { expired: false, duration: { unit: 'unlimited' } } };
        actor.updateEmbeddedDocuments('Item', [update]);
    }
    updateHUD(hud, actor);
}

const createHUD = (actor) => {
    const btn = document.createElement('div');
    btn.title = game.i18n.localize('pf2e_bardic_inspiration.inspire_base');
    btn.classList.add('control-icon');

    const icon = document.createElement('i');
    icon.className = 'fas fa-music fa-fw';
    btn.appendChild(icon);

    const statusEffects = document.createElement('div');
    statusEffects.className = 'status-effects';

    const inspireCourage = document.createElement('img');
    inspireCourage.className = 'control-icon';
    // For some reason the first child by default loses its margin, so add it back in here
    inspireCourage.style.marginTop = '2px';
    inspireCourage.title = game.i18n.localize('pf2e_bardic_inspiration.inspire_courage');
    inspireCourage.src = 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-reg.png';
    inspireCourage.setAttribute(effectIdAttribute, inspireCourageEffectName);

    const inspireHeroics = document.createElement('img');
    inspireHeroics.className = 'control-icon';
    inspireCourage.style.margin = 2;
    inspireHeroics.title = game.i18n.localize('pf2e_bardic_inspiration.inspire_heroics_success');
    inspireHeroics.src = 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-heroics-success.png';
    inspireHeroics.setAttribute(effectIdAttribute, inspireHeroicsEffectName);

    const inspireHeroicsCrit = document.createElement('img');
    inspireHeroicsCrit.className = 'control-icon';
    inspireCourage.style.margin = 2;
    inspireHeroicsCrit.title = game.i18n.localize('pf2e_bardic_inspiration.inspire_heroics_critical');
    inspireHeroicsCrit.src = 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-heroics-crit.png';
    inspireHeroicsCrit.setAttribute(effectIdAttribute, inspireHeroicsCriticalEffectName);

    statusEffects.appendChild(inspireCourage);
    statusEffects.appendChild(inspireHeroics);
    statusEffects.appendChild(inspireHeroicsCrit);

    btn.appendChild(statusEffects);

    return [btn, statusEffects, inspireCourage, inspireHeroics, inspireHeroicsCrit];
};

export const renderTokenHUD = (hud, html, token) => {
    const actor = game.actors.get(token.actorId);

    if (game.settings.get('pf2e-bardic-inspiration', 'add-inspiration-buttons') && actor.data.type.toLowerCase() === 'character') {
        const views = createHUD(actor);
        const button = views[0];
        const statusEffects = views[1];

        $(button).click((event) => tokenButtonHandler(event, actor, token));
        for (var i = 2; i < views.length; i++) {
            $(views[i]).on('mouseover mouseout', (event) => mouseoverHandler(event));
            $(views[i]).contextmenu((event) => 
                effectButtonHandler(event, actor)
            ).click((event) => 
                effectButtonHandler(event, actor)
            )
        }
        html.find('div.right').append(button);
        updateHUD($(statusEffects), actor);
    }
};
