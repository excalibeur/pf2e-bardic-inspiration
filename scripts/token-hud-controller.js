// Names of the effects in the foundry VTT database
const inspireCourageEffectName = "Courageous Anthem"
const inspireCourageHeroicsEffectName = "Inspire Heroics (Courage, +2)";
const inspireCourageHeroicsCriticalEffectName = "Inspire Heroics (Courage, +3)";
const inspireDefenseEffectName = "Rallying Anthem"
const inspireDefenseHeroicsEffectName = "Inspire Heroics (Defense, +2)";
const inspireDefenseHeroicsCriticalEffectName = "Inspire Heroics (Defense, +3)";

const effectIdAttribute = '_effect-id';
const exclusiveEffects = [
    // Keep all 3 inspire courage effects exclusive to each other.
    [inspireCourageEffectName, inspireCourageHeroicsEffectName, inspireCourageHeroicsCriticalEffectName],
    [inspireDefenseEffectName, inspireDefenseHeroicsEffectName, inspireDefenseHeroicsCriticalEffectName]
];


const getSpell = async (spell) => {
    const spellEffectPack = game.packs.get('pf2e.spell-effects');
    await spellEffectPack.getIndex();
    const spellEntry = spellEffectPack.index.find(e => e.name.includes(spell));
    return await spellEffectPack.getDocument(spellEntry._id);
}

const getSpellEffectFromActor = (actor, spell) => {
    return actor.items.filter(item => item.name.includes(spell) && item.type === 'effect');
}

const tokenButtonHandler = async (event, actor, token) => {
    const btn = $(event.currentTarget);
    btn.toggleClass('active');
    btn.find("div.status-effects").toggleClass('active');
};

const removeEffect = async (effectName, actor) => {
    const effect = getSpellEffectFromActor(actor, effectName);
    if (effect.length) {
        await actor.deleteEmbeddedDocuments('Item', effect.map(i => i.id));
    }
}

const mouseoverHandler = async (event) => {
    const statusDescr = $("div.status-effect-summary")
    statusDescr.text($(event.currentTarget)[0].title).toggleClass("active");
}

const updateHUD = async (html, actor) => {
    const $statusIcons = html.find("picture.effect-control");
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
        await removeEffect(effectName, actor);
    } else {
        // Remove exclusive effects first
        for (var i = 0; i < exclusiveEffects.length; i++) {
            const exclusiveSet = exclusiveEffects[i];
            if (exclusiveSet.includes(effectName)) {
                for (var j = 0; j < exclusiveSet.length; j++) {
                    await removeEffect(exclusiveSet[j], actor);
                }
                break;
            }
        }
        const effects = await actor.createEmbeddedDocuments('Item', [effectItem]);
        const effect = effects.find(e => e.name === effectItem.name);
        const update = { _id: effect._id, data: { expired: false, duration: { unit: 'unlimited' } } };
        actor.updateEmbeddedDocuments('Item', [update]);
    }
    updateHUD(hud, actor);
}

const buttons = [
    {
        title: 'pf2e_bardic_inspiration.inspire_courage',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-reg.png',
        effectId: inspireCourageEffectName
    },
    {
        title: 'pf2e_bardic_inspiration.inspire_courage_heroics_success',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-heroics-success.png',
        effectId: inspireCourageHeroicsEffectName
    },
    {
        title: 'pf2e_bardic_inspiration.inspire_courage_heroics_critical',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-courage-heroics-crit.png',
        effectId: inspireCourageHeroicsCriticalEffectName
    },
    {
        title: 'pf2e_bardic_inspiration.inspire_defense',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-defense-reg.png',
        effectId: inspireDefenseEffectName
    },
    {
        title: 'pf2e_bardic_inspiration.inspire_defense_heroics_success',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-defense-heroics-success.png',
        effectId: inspireDefenseHeroicsEffectName
    },
    {
        title: 'pf2e_bardic_inspiration.inspire_defense_heroics_critical',
        src: 'modules/pf2e-bardic-inspiration/artwork/inspire-defense-heroics-crit.png',
        effectId: inspireDefenseHeroicsCriticalEffectName
    }
]

const createHUD = (actor) => {
    const btn = document.createElement('div');
    btn.title = game.i18n.localize('pf2e_bardic_inspiration.inspire_base');
    btn.classList.add('control-icon');

    const icon = document.createElement('i');
    icon.className = 'fas fa-music fa-fw';
    btn.appendChild(icon);

    const statusEffects = document.createElement('div');
    statusEffects.className = 'status-effects';

    const elems = [];
    var isFirst = true;
    for (var i = 0; i < buttons.length; i++) {
        const uiButton = buttons[i];
        const picture = document.createElement("picture");
        picture.className = 'effect-control';
        picture.title = game.i18n.localize(uiButton.title);
        const elem = document.createElement('img');
        picture.appendChild(elem);
        elem.className = 'control-icon';
        if (isFirst) {
            elem.style.marginTop = '2px';
            isFirst = false;
        } else {
            elem.style.margin = 2;
        }
        elem.src = uiButton.src;
        picture.setAttribute(effectIdAttribute, uiButton.effectId);
        elems.push(picture);
        statusEffects.appendChild(picture);
    }

    btn.appendChild(statusEffects);

    return [btn, statusEffects, elems];
};

export const renderTokenHUD = (hud, html, token) => {
    const actor = game.actors.get(token.actorId);

    if (game.settings.get('pf2e-bardic-inspiration', 'add-inspiration-buttons') && actor.type.toLowerCase() === 'character') {
        const views = createHUD(actor);
        const button = views[0];
        const statusEffects = views[1];
        const statusButtons = views[2];

        $(button).click((event) => tokenButtonHandler(event, actor, token));
        for (var i = 0; i < statusButtons.length; i++) {
            $(statusButtons[i]).on('mouseover mouseout', (event) => mouseoverHandler(event));
            $(statusButtons[i]).contextmenu((event) =>
                effectButtonHandler(event, actor)
            ).click((event) =>
                effectButtonHandler(event, actor)
            )
        }
        html.find('div.right').append(button);
        updateHUD($(statusEffects), actor);
    }
};
