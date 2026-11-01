const AVATAR = "https://api.dicebear.com/9.x/open-peeps/svg?seed=";

const ITEM_NAMES = {
    phone: "Phone",
    glasses: "Glasses",
    bag: "Bag",
    cup: "Cup",
    crumbs: "Cake crumbs"
};

const PICTURE = [
    {
        id: "balcony",
        name: "Balcony",
        floor: 2,
        guests: [
            { name: "Aigerim", color: "green", time: "20:45", aitu: true, items: ["cup", "crumbs"] },
            { name: "Aliya", color: "black", time: "21:15", aitu: false, items: ["phone", "cup"] },
            { name: "Madina", color: "green", time: "22:10", aitu: false, items: ["phone", "bag", "crumbs"] },
            { name: "Ivan", color: "black", time: "20:10", aitu: true, items: ["cup"] }
        ]
    },
    {
        id: "hall",
        name: "Hall",
        floor: 2,
        guests: [
            { name: "Arman", color: "yellow", time: "20:35", aitu: false, items: ["bag", "glasses"] },
            { name: "Sophia", color: "purple", time: "21:20", aitu: true, items: ["phone"] },
            { name: "Dias", color: "green", time: "19:45", aitu: true, items: [] },
            { name: "Bekzat", color: "purple", time: "20:55", aitu: false, items: ["bag", "cup", "crumbs"] },
            { name: "Aruzhan", color: "blue", time: "21:50", aitu: true, items: ["phone"] },
            { name: "Saule", color: "green", time: "21:25", aitu: false, items: ["glasses"] }
        ]
    },
    {
        id: "kitchen",
        name: "Kitchen",
        floor: 1,
        guests: [
            { name: "Nurlan", color: "red", time: "19:40", aitu: true, items: ["phone", "cup"] },
            { name: "Emma", color: "black", time: "20:15", aitu: false, items: ["bag"] },
            { name: "Timur", color: "green", time: "21:05", aitu: true, items: ["phone", "bag", "crumbs"] },
            { name: "Sergey", color: "yellow", time: "20:50", aitu: false, items: [] },
            { name: "Yerlan", color: "red", time: "21:40", aitu: true, items: ["glasses", "phone"] },
            { name: "Kamila", color: "green", time: "20:05", aitu: false, items: ["cup"] }
        ]
    },
    {
        id: "living",
        name: "Living room",
        floor: 1,
        guests: [
            { name: "Daniel", color: "blue", time: "19:55", aitu: true, items: ["glasses"] },
            { name: "Zarina", color: "green", time: "21:10", aitu: false, items: ["bag", "phone", "crumbs"] },
            { name: "Natasha", color: "yellow", time: "20:30", aitu: true, items: [] },
            { name: "Askar", color: "black", time: "21:00", aitu: true, items: ["phone"] },
            { name: "Inkar", color: "purple", time: "20:20", aitu: false, items: ["bag"] }
        ]
    }
];

const MIRAS = { name: "Miras", color: "blue", time: "21:20", aitu: true, items: ["phone"] };

let party = JSON.parse(JSON.stringify(PICTURE));

const FADE = 300;
const PALE = 0.2;
const ITEM_WORDS = {
    phone: "a phone",
    glasses: "glasses",
    bag: "a bag",
    cup: "a cup",
    crumbs: "cake crumbs"
};
const ROOM_WORDS = {
    balcony: "On the balcony",
    hall: "In the hall",
    kitchen: "In the kitchen",
    living: "In the living room"
};
const MOVE_WORDS = {
    balcony: "Move to the balcony",
    hall: "Move to the hall",
    kitchen: "Move to the kitchen",
    living: "Move to the living room"
};

let sorted = {};
let openGuest = null;
let openPanel = null;
let moving = false;

function room(id) {
    return party.find(function (r) {
        return r.id === id;
    });
}

function findGuest(name) {
    for (const r of party) {
        const i = r.guests.findIndex(function (g) {
            return g.name === name;
        });
        if (i !== -1) {
            return { room: r, index: i };
        }
    }
    return null;
}

function dropGuest(name) {
    const found = findGuest(name);
    if (found) {
        found.room.guests.splice(found.index, 1);
    }
}

function restoreGuest(name) {
    if (findGuest(name)) {
        return;
    }
    for (const r of PICTURE) {
        const i = r.guests.findIndex(function (g) {
            return g.name === name;
        });
        if (i !== -1) {
            room(r.id).guests.splice(i, 0, JSON.parse(JSON.stringify(r.guests[i])));
            return;
        }
    }
}

function icon(name) {
    return $("<span>", { class: "item item--" + name }).append($("#sprite .ico--" + name).clone());
}

function buildGuest(guest, roomData, order) {
    const $ring = $("<div>", { class: "guest__ring" });
    $("<img>", {
        class: "guest__photo",
        src: AVATAR + encodeURIComponent(guest.name),
        alt: guest.name
    }).on("error", function () {
        $(this).replaceWith($("<span>", { class: "guest__initial", text: guest.name.charAt(0) }));
    }).appendTo($ring);

    const $items = $("<div>", { class: "guest__items" });
    guest.items.forEach(function (item) {
        $items.append(icon(item));
    });

    const classes = ["guest", "wear-" + guest.color];
    if (guest.aitu) {
        classes.push("aitu");
    }
    guest.items.forEach(function (item) {
        classes.push("has-" + item);
    });

    const $guest = $("<article>", {
        class: classes.join(" "),
        tabindex: 0,
        "data-name": guest.name,
        "data-time": guest.time,
        "data-color": guest.color,
        "data-room": roomData.id,
        "data-floor": roomData.floor,
        "data-aitu": guest.aitu ? "yes" : "no",
        "data-items": guest.items.length ? guest.items.join(",") : "none",
        "data-order": order
    });

    $guest.append($ring);
    if (guest.aitu) {
        $guest.append($("<span>", { class: "badge", text: "AITU" }));
    }
    $guest.append($("<p>", { class: "guest__name", text: guest.name }));
    $guest.append($("<p>", { class: "guest__time", text: guest.time }));
    $guest.append($items);
    return $guest;
}

function buildRoom(roomData) {
    const $row = $("<div>", { class: "room__row" });
    roomData.guests.forEach(function (guest, i) {
        $row.append(buildGuest(guest, roomData, i));
    });

    const $head = $("<div>", { class: "room__head" })
        .append($("<h3>", { class: "room__name", text: roomData.name }))
        .append($("<span>", { class: "room__count", text: roomData.guests.length + " guests" }))
        .append($("<button>", {
            type: "button",
            class: "btn btn--small sort",
            "data-room": roomData.id,
            text: "Sort by time"
        }));

    return $("<section>", {
        class: "room",
        "data-room": roomData.id,
        "data-floor": roomData.floor
    }).append($head).append($row);
}

function render() {
    closeCard(true);
    sorted = {};
    const $floors = $("#floors").empty();
    [2, 1].forEach(function (floor) {
        const $rooms = $("<div>", { class: "floor__rooms" });
        party.filter(function (r) {
            return r.floor === floor;
        }).forEach(function (r) {
            $rooms.append(buildRoom(r));
        });
        $floors.append($("<div>", { class: "floor", "data-floor": floor })
            .append($("<span>", { class: "floor__label", text: "Floor " + floor }))
            .append($rooms));
    });
}

function refreshCounts() {
    $(".room").each(function () {
        $(this).find(".room__count").text($(this).find(".guest").length + " guests");
    });
}

const CASES = [
    {
        n: 1,
        title: "Who is in the hall?",
        kind: "guests",
        code: '$(\'.room[data-room="hall"] .guest\')',
        run: function () {
            return $('.room[data-room="hall"] .guest');
        }
    },
    {
        n: 2,
        title: "Who is dressed in yellow or purple?",
        kind: "guests",
        code: '$(".guest.wear-yellow, .guest.wear-purple")',
        run: function () {
            return $(".guest.wear-yellow, .guest.wear-purple");
        }
    },
    {
        n: 3,
        title: "Which AITU students are upstairs?",
        kind: "guests",
        code: '$(\'.floor[data-floor="2"] .guest.aitu\')',
        run: function () {
            return $('.floor[data-floor="2"] .guest.aitu');
        }
    },
    {
        n: 4,
        title: "Who has glasses or a bag?",
        kind: "guests",
        code: '$(".guest.has-glasses, .guest.has-bag")',
        run: function () {
            return $(".guest.has-glasses, .guest.has-bag");
        }
    },
    {
        n: 5,
        title: "Who came with nothing at all?",
        kind: "guests",
        code: '$(".guest").not(":has(.item)")',
        run: function () {
            return $(".guest").not(":has(.item)");
        }
    },
    {
        n: 6,
        title: "Who has a phone but no bag?",
        kind: "guests",
        code: '$(".guest.has-phone").not(".has-bag")',
        run: function () {
            return $(".guest.has-phone").not(".has-bag");
        }
    },
    {
        n: 7,
        title: "Who arrived between 20:30 and 21:00, both times included?",
        kind: "guests",
        code: '$(".guest").filter(function () {\n    const t = $(this).data("time");\n    return t >= "20:30" && t <= "21:00";\n})',
        run: function () {
            return $(".guest").filter(function () {
                const t = $(this).data("time");
                return t >= "20:30" && t <= "21:00";
            });
        }
    },
    {
        n: 8,
        title: "Who arrived after 21:00 and is not an AITU student?",
        kind: "guests",
        code: '$(".guest").not(".aitu").filter(function () {\n    return $(this).data("time") > "21:00";\n})',
        run: function () {
            return $(".guest").not(".aitu").filter(function () {
                return $(this).data("time") > "21:00";
            });
        }
    },
    {
        n: 9,
        title: "Who stands right next to Askar?",
        kind: "guests",
        code: '$(\'.guest[data-name="Askar"]\').prev(".guest").add(\'.guest[data-name="Askar"] + .guest\')',
        run: function () {
            return $('.guest[data-name="Askar"]').prev(".guest").add('.guest[data-name="Askar"] + .guest');
        }
    },
    {
        n: 10,
        title: "Who stands last in each room?",
        kind: "guests",
        code: '$(".room__row .guest:last-child")',
        run: function () {
            return $(".room__row .guest:last-child");
        }
    },
    {
        n: 11,
        title: "Who stands third in each room?",
        kind: "guests",
        code: '$(".room__row .guest:nth-child(3)")',
        run: function () {
            return $(".room__row .guest:nth-child(3)");
        }
    },
    {
        n: 12,
        title: "Who stands after Timur in his room?",
        kind: "guests",
        code: '$(\'.guest[data-name="Timur"]\').nextAll(".guest")',
        run: function () {
            return $('.guest[data-name="Timur"]').nextAll(".guest");
        }
    },
    {
        n: 13,
        title: "Who stands right before someone in black?",
        kind: "guests",
        code: '$(".guest.wear-black").prev(".guest")',
        run: function () {
            return $(".guest.wear-black").prev(".guest");
        }
    },
    {
        n: 14,
        title: "In which room is Aruzhan?",
        kind: "rooms",
        code: '$(\'.guest[data-name="Aruzhan"]\').closest(".room")',
        run: function () {
            return $('.guest[data-name="Aruzhan"]').closest(".room");
        }
    },
    {
        n: 15,
        title: "Which rooms have fewer than 6 guests?",
        kind: "rooms",
        code: '$(".room").not(":has(.guest:nth-child(6))")',
        run: function () {
            return $(".room").not(":has(.guest:nth-child(6))");
        }
    },
    {
        n: 16,
        title: "In which rooms does somebody have a cup, but nobody wears glasses?",
        kind: "rooms",
        code: '$(".room:has(.guest.has-cup)").not(":has(.guest.has-glasses)")',
        run: function () {
            return $(".room:has(.guest.has-cup)").not(":has(.guest.has-glasses)");
        }
    },
    {
        n: 17,
        title: "Who came first to each room?",
        kind: "guests",
        code: '$(".guest").filter(function () {\n    const t = $(this).data("time");\n    return $(this).siblings(".guest").filter(function () {\n        return $(this).data("time") < t;\n    }).length === 0;\n})',
        run: function () {
            return $(".guest").filter(function () {
                const t = $(this).data("time");
                return $(this).siblings(".guest").filter(function () {
                    return $(this).data("time") < t;
                }).length === 0;
            });
        }
    },
    {
        n: 18,
        title: "Miras joins the party between Askar and Inkar",
        kind: "guests",
        quiet: true,
        code: 'buildGuest(MIRAS, room("living"), 4)\n    .hide()\n    .insertAfter(\'.guest[data-name="Askar"]\')\n    .fadeIn(700)',
        run: function () {
            const place = findGuest("Askar");
            place.room.guests.splice(place.index + 1, 0, JSON.parse(JSON.stringify(MIRAS)));
            const $miras = buildGuest(MIRAS, place.room, place.index + 1)
                .hide()
                .insertAfter('.guest[data-name="Askar"]')
                .fadeIn(700, refreshCounts);
            return $miras;
        }
    },
    {
        n: 19,
        title: "Natasha says goodbye and goes home",
        kind: "guests",
        quiet: true,
        code: '$(\'.guest[data-name="Natasha"]\').fadeOut(700, function () {\n    $(this).remove();\n})',
        run: function () {
            dropGuest("Natasha");
            return $('.guest[data-name="Natasha"]').fadeOut(700, function () {
                $(this).remove();
                refreshCounts();
            });
        }
    },
    {
        n: 20,
        title: "Who took the cake?",
        kind: "guests",
        code: '$(\'.floor[data-floor="1"] .guest.has-crumbs\')\n    .not(".has-cup")\n    .filter(function () {\n        const t = $(this).data("time");\n        return t > "21:00" && t < "21:30";\n    })\n    .filter(function () {\n        return $(this).prev(".guest").hasClass("aitu") || $(this).next(".guest").hasClass("aitu");\n    })',
        run: function () {
            return $('.floor[data-floor="1"] .guest.has-crumbs')
                .not(".has-cup")
                .filter(function () {
                    const t = $(this).data("time");
                    return t > "21:00" && t < "21:30";
                })
                .filter(function () {
                    return $(this).prev(".guest").hasClass("aitu") || $(this).next(".guest").hasClass("aitu");
                });
        }
    }
];

function namesOf($found, kind) {
    return $found.map(function () {
        return kind === "rooms" ? $(this).find(".room__name").text() : $(this).data("name");
    }).get();
}

function jump($found) {
    $found.stop(true, true).animate({ top: -18 }, 170).animate({ top: 0 }, 170);
}

function say(caseData, $found) {
    const names = namesOf($found, caseData.kind);
    const word = caseData.kind === "rooms" ? "room" : "guest";
    const count = names.length === 1 ? "1 " + word : names.length + " " + word + "s";
    $("#verdict-case").text("Case " + caseData.n + ". " + caseData.title);
    $("#verdict-answer").empty()
        .append($("<strong>", { text: names.length ? count : "nobody" }))
        .append(names.length ? ": " + names.join(", ") : "");
    $("#verdict-code").text(caseData.code);
}

function runCase(caseData) {
    if (caseData.n === 18) {
        dropGuest("Miras");
    }
    if (caseData.n === 19) {
        restoreGuest("Natasha");
    }
    render();
    const $found = caseData.run();
    $found.addClass("is-found");
    spotlight($found, caseData.kind);
    if (!caseData.quiet) {
        jump($found);
    }
    say(caseData, $found);
}

function buildCaseButtons() {
    const $cases = $("#cases").empty();
    CASES.forEach(function (caseData) {
        $("<button>", { type: "button", class: "case", "data-case": caseData.n })
            .append($("<span>", { class: "case__n", text: caseData.n }))
            .append($("<span>", { text: caseData.title }))
            .appendTo($cases);
    });
}

function buildLegend() {
    const $legend = $("#legend-items").empty();
    Object.keys(ITEM_NAMES).forEach(function (key) {
        $("<span>", { class: "legend__item" })
            .append(icon(key))
            .append($("<span>", { text: ITEM_NAMES[key] }))
            .appendTo($legend);
    });
}

buildCaseButtons();
buildLegend();
render();

$("#cases").on("click", ".case", function () {
    const caseData = CASES[$(this).data("case") - 1];
    $(".case").removeClass("is-active");
    $(this).addClass("is-active");
    runCase(caseData);
});

$("#clear").on("click", function () {
    $(".case").removeClass("is-active");
    $(".is-found").removeClass("is-found");
    $(".guest").stop(true, true).fadeTo(FADE, 1);
    $("#verdict-case").text("Everybody is bright again");
    $("#verdict-answer").text("The spotlight is off.");
    $("#verdict-code").text('$(".guest").stop(true, true).fadeTo(300, 1);');
});

$("#reset").on("click", function () {
    party = JSON.parse(JSON.stringify(PICTURE));
    render();
    $(".case").removeClass("is-active");
    $("#verdict-case").text("The party is back as in the picture");
    $("#verdict-answer").text("21 guests, 4 rooms, 2 floors.");
    $("#verdict-code").text('party = JSON.parse(JSON.stringify(PICTURE));');
});

function spotlight($found, kind) {
    const $bright = kind === "rooms" ? $found.find(".guest") : $found;
    const $all = $(".guest").stop(true, true);
    $all.not($bright).fadeTo(FADE, PALE);
    $bright.fadeTo(FADE, 1);
}

function itemsOf($guest) {
    const raw = String($guest.attr("data-items"));
    return raw === "none" ? [] : raw.split(",");
}

function itemSentence(items) {
    const words = items.map(function (item) {
        return ITEM_WORDS[item];
    });
    if (words.length === 0) {
        return "Came with nothing";
    }
    if (words.length === 1) {
        return "Has " + words[0];
    }
    return "Has " + words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

function avatarBox($guest) {
    const $ring = $guest.find(".guest__ring");
    const box = $ring.offset();
    return { left: box.left, top: box.top, width: $ring.outerWidth(), height: $ring.outerHeight() };
}

function openCard($guest) {
    if (openGuest && openGuest.is($guest)) {
        closeCard();
        return;
    }
    closeCard(true);

    const name = $guest.attr("data-name");
    const roomId = $guest.attr("data-room");
    const items = itemsOf($guest);

    const $facts = $("<ul>", { class: "gcard__facts" });
    [
        "Came at " + $guest.attr("data-time"),
        $guest.hasClass("aitu") ? "AITU student" : "Not an AITU student",
        "Dressed in " + $guest.attr("data-color"),
        itemSentence(items),
        ROOM_WORDS[roomId] + ", place " + ($guest.index() + 1) + " from the left"
    ].forEach(function (line) {
        $facts.append($("<li>", { text: line }));
    });

    const $moves = $("<div>", { class: "gcard__moves" });
    party.forEach(function (r) {
        if (r.id !== roomId) {
            $moves.append($("<button>", {
                type: "button",
                class: "btn btn--small move",
                "data-to": r.id,
                text: MOVE_WORDS[r.id]
            }));
        }
    });

    const $inner = $("<div>", { class: "gcard__inner" })
        .append($("<div>", { class: "gcard__head" })
            .append($guest.find(".guest__ring").clone())
            .append($("<div>")
                .append($("<p>", { class: "gcard__name", text: name }))
                .append($("<p>", { class: "gcard__where", text: $guest.closest(".room").find(".room__name").text() }))))
        .append($facts)
        .append($moves)
        .append($("<button>", { type: "button", class: "btn btn--small gcard__close", text: "Close (Esc)" }));

    const $panel = $("<div>", { class: "gcard wear-" + $guest.attr("data-color") }).append($inner);
    const $layer = $("#layer").prop("hidden", false).css({ height: $(document).height() });

    $panel.css({ visibility: "hidden", left: 0, top: 0 }).appendTo($layer);
    const width = $panel.outerWidth();
    const height = $panel.outerHeight();
    $inner.css({ width: $inner.outerWidth() });

    const box = avatarBox($guest);
    const left = $(window).scrollLeft() + ($(window).width() - width) / 2;
    const top = $(window).scrollTop() + Math.max(20, ($(window).height() - height) / 2);

    $panel.css({
        visibility: "visible",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        opacity: 0.4
    });
    $inner.css({ opacity: 0 });

    $(".layer__back").stop(true, true).fadeTo(220, 1);
    $panel.animate({ left: left, top: top, width: width, height: height, opacity: 1 }, 420);
    $inner.animate({ opacity: 1 }, 340);

    openGuest = $guest;
    openPanel = $panel;
}

function closeCard(instant) {
    if (!openPanel) {
        return;
    }
    const $panel = openPanel;
    const $guest = openGuest;
    openPanel = null;
    openGuest = null;

    const $back = $(".layer__back").stop(true, true);
    const gone = !$guest || !$guest.closest("body").length;

    if (instant || gone) {
        $panel.stop(true).remove();
        $back.css("opacity", 0);
        $("#layer").prop("hidden", true);
        return;
    }

    const box = avatarBox($guest);
    $back.fadeTo(200, 0);
    $panel.stop(true)
        .find(".gcard__inner").stop(true).animate({ opacity: 0 }, 160).end()
        .animate({
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            opacity: 0
        }, 340, function () {
            $(this).remove();
            if (!openPanel) {
                $("#layer").prop("hidden", true);
            }
        });
}

function flip($row, order) {
    const $cards = $row.children(".guest").stop(true, true).css({ left: 0, top: 0 });
    const before = new Map();
    $cards.each(function () {
        before.set(this, $(this).offset());
    });
    $row.append(order);
    $cards.each(function () {
        const was = before.get(this);
        const now = $(this).offset();
        $(this).css({ left: was.left - now.left, top: was.top - now.top }).animate({ left: 0, top: 0 }, 420);
    });
}

function sortRoom(roomId) {
    const $room = $('.room[data-room="' + roomId + '"]');
    const $row = $room.find(".room__row");
    const $cards = $row.children(".guest");
    if ($cards.length < 2) {
        return;
    }
    const byTime = !sorted[roomId];
    sorted[roomId] = byTime;
    const order = $cards.toArray().sort(function (a, b) {
        return byTime
            ? String($(a).attr("data-time")).localeCompare(String($(b).attr("data-time")))
            : Number($(a).attr("data-order")) - Number($(b).attr("data-order"));
    });
    flip($row, order);
    $room.find(".sort").text(byTime ? "Back to the picture" : "Sort by time");
}

function moveGuest($guest, toId) {
    const fromId = $guest.attr("data-room");
    if (moving || fromId === toId) {
        return;
    }
    const $target = $('.room[data-room="' + toId + '"] .room__row');
    if (!$target.length) {
        return;
    }
    moving = true;

    const name = $guest.attr("data-name");
    const start = $guest.offset();
    const width = $guest.outerWidth();
    const height = $guest.outerHeight();

    const $ghost = $guest.clone()
        .addClass("flying")
        .css({ left: start.left, top: start.top, width: width, height: height })
        .appendTo("body");

    const $oldGap = $("<div>", { class: "gap" }).css({ width: width, height: height }).insertAfter($guest);
    $guest.detach().css({ left: 0, top: 0 });

    const found = findGuest(name);
    if (found) {
        const data = found.room.guests.splice(found.index, 1)[0];
        room(toId).guests.push(data);
    }
    $guest.attr({
        "data-room": toId,
        "data-floor": room(toId).floor,
        "data-order": room(toId).guests.length - 1
    }).data({ room: toId, floor: room(toId).floor, order: room(toId).guests.length - 1 });

    const $newGap = $("<div>", { class: "gap" }).css({ width: 0, height: height }).appendTo($target);
    $newGap.animate({ width: width }, 380, function () {
        const end = $newGap.offset();
        $ghost.animate({ left: end.left, top: end.top }, 650, function () {
            $guest.insertBefore($newGap);
            $newGap.remove();
            $ghost.remove();
            $oldGap.animate({ width: 0 }, 380, function () {
                $(this).remove();
                refreshCounts();
                moving = false;
            });
        });
    });
}

$("#floors").on("click", ".guest", function () {
    openCard($(this));
});

$("#floors").on("keydown", ".guest", function (event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard($(this));
    }
});

$("#floors").on("click", ".sort", function (event) {
    event.stopPropagation();
    sortRoom($(this).attr("data-room"));
});

$("#layer").on("click", function (event) {
    if (!$(event.target).closest(".gcard").length) {
        closeCard();
    }
});

$("#layer").on("click", ".gcard__close", function () {
    closeCard();
});

$("#layer").on("click", ".move", function () {
    const $guest = openGuest;
    const toId = $(this).attr("data-to");
    closeCard();
    moveGuest($guest, toId);
});

$(document).on("keydown", function (event) {
    if (event.key === "Escape") {
        closeCard();
    }
});
