var deck;
var demandCardsDrawn = 0;
var power;
var iron;
var aluminium;
var carbon;
var steel;
var lithium;

var playerRed;
var playerGreen;
var playerBlue;
var playerYellow;

function resource(name, price, supply) {
    return {
        name: name,
        price: price,
        supply: supply,
        maxSupply: supply,
        demand: 0
    };
}

function getPrice(resource, amount){
    if(!amount) amount = 1;

    if(amount > resource.maxSupply) {
        exception = "Illegal argument exception. name: " + resource + "amount: " + amount;
        console.error(exception);
        return exception;
    } 
    if(resource.supply >= amount) return amount * resource.price
    else return (amount - resource.supply) * (resource.price + 1) + resource.supply * resource.price;
}

function adjustSupply(resource, amount) {
    if (amount < 0) {
        if(-amount < resource.supply) {
            resource.supply += amount;
        } else {
            resource.price += 1 + Math.floor((-amount - resource.supply) / resource.maxSupply);
            resource.supply = resource.maxSupply - ((-amount - resource.supply) % resource.maxSupply);
        }
    } else if (amount > 0) {
        if(amount <= resource.maxSupply - resource.supply) {
            resource.supply += amount;
        } else {
            resource.price -= 1 + Math.floor((amount - (resource.maxSupply - resource.supply)) / resource.maxSupply);
            resource.supply = (amount - (resource.maxSupply - resource.supply)) % resource.maxSupply;
            if(resource.price < 1) {
                resource.price = 1;
                resource.supply = resource.maxSupply;
            }
        }
    }
}

function produceForBuilding(buildingName){
    switch (buildingName) {
        case "mineIron": adjustSupply(iron, 1); adjustSupply(power, -1); break;
        case "mineAluminium": adjustSupply(aluminium, 1); adjustSupply(power, -1); break;
        case "mineCarbon": adjustSupply(carbon, 1); adjustSupply(power, -1); break;
        case "furnace":  adjustSupply(steel, 1); adjustSupply(power, -1); adjustSupply(iron, -1); break;
        case "lab":  adjustSupply(lithium, 1); adjustSupply(aluminium, -1); adjustSupply(carbon, -1); break;
        case "fossilPowerPlant":  adjustSupply(power, 3); adjustSupply(carbon, -1); break;
        case "geothermalPlant":  adjustSupply(power, 2); break;
        case "windTurbine":  adjustSupply(power, 1); break;
        default:
            console.error("Illegal argument exception. name: " + name);
            break;
    }
}

function buildBuilding(buildingName, carbonFabrication){
    modifyBuilding(buildingName, carbonFabrication, true);
}

function modifyBuilding(buildingName, carbonFabrication, add){
    multiplier = -1;
    if(!add) multiplier = 1;
    if(carbonFabrication){
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return adjustSupply(carbon, 3 * multiplier);
                break;
            case "geothermalPlant": 
                return adjustSupply(carbon, 6 * multiplier);
                break;
            case "windTurbine": 
                return adjustSupply(lithium, 1 * multiplier) + adjustSupply(aluminium, 1 * multiplier);
                break;
            case "supplyConnector":
                return adjustSupply(aluminium, 1 * multiplier);
                break;
            case "constructionSite":
                return adjustSupply(carbon, 2 * multiplier);
                break;
            default:
                exception = "Illegal argument exception. name: " + name;
                console.error(exception);
                return exception;
                break;
        }
    } else {
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return adjustSupply(steel, 2 * multiplier);
                break;
            case "geothermalPlant": 
                return adjustSupply(steel, 4 * multiplier);
                break;
            case "windTurbine": 
                return adjustSupply(lithium, 1 * multiplier) + adjustSupply(aluminium, 1 * multiplier);
                break;
            case "supplyConnector":
                return adjustSupply(aluminium, 1 * multiplier);
                break;
            case "constructionSite":
                return adjustSupply(steel, 1 * multiplier);
                break;
            default:
                exception = "Illegal argument exception. name: " + name;
                console.error(exception);
                return exception;
                break;
        }
    }
}

function getBuildingPrice(buildingName, carbonFabrication){
    if(carbonFabrication){
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return getPrice(carbon, 3);
                break;
            case "geothermalPlant": 
                return getPrice(carbon, 6);
                break;
            case "windTurbine": 
                return getPrice(lithium) + getPrice(aluminium);
                break;
            case "supplyConnector":
                return getPrice(aluminium);
                break;
            case "constructionSite":
                return getPrice(carbon, 2);
                break;
            default:
                exception ="Illegal argument exception. name: " + name;
                console.error(exception);
                return exception;
                break;
        }
    } else {
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return getPrice(steel, 2);
                break;
            case "geothermalPlant": 
                return getPrice(steel, 4);
                break;
            case "windTurbine": 
                return getPrice(lithium) + getPrice(aluminium);
                break;
            case "supplyConnector":
                return getPrice(aluminium);
                break;
            case "constructionSite":
                return getPrice(steel);
                break;
            default:
                exception = "Illegal argument exception. name: " + name;
                console.error(exception);
                return exception;
                break;
        }
    }
}

function getBuildingRevenue(buildingName, market){
    revenue = 0;
    switch (buildingName) {
        case "mineIron": revenue = getPrice(market.iron) - getPrice(market.power); break;
        case "mineAluminium": revenue = getPrice(market.aluminium) - getPrice(market.power); break;
        case "mineCarbon": revenue = getPrice(market.carbon) - getPrice(market.power); break;
        case "furnace": revenue = getPrice(market.steel) - getPrice(market.power) - getPrice(iron); break;
        case "lab": revenue = getPrice(market.lithium) - getPrice(market.carbon) - getPrice(market.aluminium); break;
        case "fossilPowerPlant": revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
        case "geothermalPlant": revenue = getPrice(market.power) * 2; break;
        case "windTurbine": revenue = getPrice(market.power); break;
        case "supplyConnector": revenue = 0; break;
        case "constructionSite": revenue = 0; break;
        default:
            console.error("Illegal argument exception. name: " + buildingName);
            break;
    }
    if(revenue < 0) return 0;
    return revenue;
}

function player(color){
    return {
        color: color,
        debt: 0,
        accumulateDebt: false,
        buildings: [],
        carbonFabrication: false
    };
}

function addDebt(player, amount){
    player.debt += amount;
}

function addBuilding(player, buildingName){
    player.buildings.push(buildingName);
    buildBuilding(buildingName, player.carbonFabrication);
}

function removeBuilding(player, buildingName){
    index = player.buildings.indexOf(buildingName);
    if(index > -1){
        player.buildings.splice(index, 1);
        modifyBuilding(buildingName, player.carbonFabrication, false);
    } else {
        console.error("Invalid argument exception. player: " + player + ", buildingName: " + buildingName);
    }
}

function getDemand() {
    total = getTotal(deck)
    if (total === 0) {
        return "nothing"
    }
    demandCardsDrawn++;
    randomInt = Math.floor(Math.random() * total);
    temp = 0
    temp += deck.steel
    if(randomInt < temp) {
        deck.steel = deck.steel - 1;
        steel.demand++;
        return "steel"
    }
    temp += deck.lithium
    if(randomInt < temp) {
        deck.lithium = deck.lithium - 1;
        lithium.demand++;
        return "lithium"
    }
    temp += deck.carbon
    if(randomInt < temp) {
        deck.carbon = deck.carbon - 1;
        carbon.demand++;
        return "carbon"
    }
    temp += deck.iron
    if(randomInt < temp) {
        deck.iron = deck.iron - 1;
        iron.demand++;
        return "iron"
    }
    temp += deck.aluminium
    if(randomInt < temp) {
        deck.aluminium = deck.aluminium - 1;
        aluminium.demand++;
        return "aluminium"
    }
    temp += deck.power
    if(randomInt < temp) {
        deck.power = deck.power - 1;
        power.demand++;
        return "power"
    }
    temp += deck.interest
    if(randomInt < temp) {
        deck.interest = deck.interest - 1;
        interest();
        return "interest"
    }
    exception = "IllegalStateException. Deck: " + deck
    console.error(exception);
    return exception
}

function getTotal(deck) {
    total = 0
    total += deck.steel
    total += deck.lithium
    total += deck.carbon
    total += deck.iron
    total += deck.aluminium
    total += deck.power
    total += deck.interest
    return total
}

function interest(){
    playerRed.debt += Math.floor(playerRed.debt / 5);
    playerBlue.debt += Math.floor(playerBlue.debt / 5);
    playerGreen.debt += Math.floor(playerGreen.debt / 5);
    playerYellow.debt += Math.floor(playerYellow.debt / 5);
}

function updateMarket(player, market){
    if (!player.accumulateDebt){
        player.buildings.forEach(buildingName => {
            buildingRevenue = getBuildingRevenue(buildingName, market);
            if(buildingRevenue > 0 ){
                produceForBuilding(buildingName);
            }
        });
    } else{
        addDebt(player, demandCardsDrawn);
    }
}

function getMarket(){
    return {
        power: power,
        iron: iron,
        aluminium: aluminium,
        carbon: carbon,
        steel: steel,
        lithium: lithium
    }
}

function getIncome(player){
    revenue = 0;
    player.buildings.forEach(function(building) {
        revenue += getBuildingRevenue(building, getMarket());
    });
    return revenue;
}

function adjustSupplyForDemand(){
    adjustSupply(power, -power.demand);
    adjustSupply(iron, -iron.demand);
    adjustSupply(carbon, -carbon.demand);
    adjustSupply(aluminium, -aluminium.demand);
    adjustSupply(steel, -steel.demand);
    adjustSupply(lithium, -lithium.demand);
}

function produce(){
    market = {
        power: jQuery.extend(true, {}, power),
        iron: jQuery.extend(true, {}, iron),
        aluminium: jQuery.extend(true, {}, aluminium),
        carbon: jQuery.extend(true, {}, carbon),
        steel: jQuery.extend(true, {}, steel),
        lithium: jQuery.extend(true, {}, lithium)
    }

    updateMarket(playerRed, market);
    updateMarket(playerBlue, market);
    updateMarket(playerGreen, market);
    updateMarket(playerYellow, market);

    adjustSupplyForDemand();

    playerRed.accumulateDebt = false;
    playerBlue.accumulateDebt = false;
    playerGreen.accumulateDebt = false;
    playerYellow.accumulateDebt = false;
}

function initializeResources(){
    power = resource("power", 1, 10);
    iron = resource("iron", 2, 5);
    aluminium = resource("aluminium", 2, 5);
    carbon = resource("carbon", 2, 5);
    steel = resource("steel", 4, 7);
    lithium = resource("lithium", 6, 4);
}

function initializeDemandDeck() {
    deck = {};
    deck.steel = 3;
    deck.lithium = 4;
    deck.carbon = 4;
    deck.iron = 4;
    deck.aluminium = 4;
    deck.power = 7;
    deck.interest = 6;
    return deck;
}

function initializePlayers(){
    playerRed = player("red");
    playerGreen = player("green");
    playerBlue = player("blue");
    playerYellow = player("yellow");
}

function initialize(){
    console.log("Initializing...");

    initializeResources();
    initializeDemandDeck();
    initializePlayers();
}

function test(){
    initialize();
    getDemand();
    addBuilding(playerRed, "mineIron");
    addBuilding(playerBlue, "mineCarbon");
    addBuilding(playerGreen, "fossilPowerPlant");
    getMarket();
    produce();
    getMarket();
    getDemand();
    addBuilding(playerRed, "windTurbine");
    playerBlue.carbonFabrication = true;
    addBuilding(playerGreen, "geothermalPlant");
    playerGreen.accumulateDebt = true;
    produce();
    getMarket();
}

//
// UI CODE BELOW
//

function registerMarketClickListeners() {
    // Power
    $( ".box-item--power .box-item-buttons .plus" ).click(function() {
        adjustSupply(power, 1);
        renderUI();
    });
    $( ".box-item--power .box-item-buttons .minus" ).click(function() {
        adjustSupply(power, -1);
        renderUI();
    });

    // Iron
    $( ".box-item--iron .box-item-buttons .plus" ).click(function() {
        adjustSupply(iron, 1);
        renderUI();
    });
    $( ".box-item--iron .box-item-buttons .minus" ).click(function() {
        adjustSupply(iron, -1);
        renderUI();
    });

    // Aluminium
    $( ".box-item--aluminium .box-item-buttons .plus" ).click(function() {
        adjustSupply(aluminium, 1);
        renderUI();
    });
    $( ".box-item--aluminium .box-item-buttons .minus" ).click(function() {
        adjustSupply(aluminium, -1);
        renderUI();
    });

    // Carbon
    $( ".box-item--carbon .box-item-buttons .plus" ).click(function() {
        adjustSupply(carbon, 1);
        renderUI();
    });
    $( ".box-item--carbon .box-item-buttons .minus" ).click(function() {
        adjustSupply(carbon, -1);
        renderUI();
    });

    // Steel
    $( ".box-item--steel .box-item-buttons .plus" ).click(function() {
        adjustSupply(steel, 1);
        renderUI();
    });
    $( ".box-item--steel .box-item-buttons .minus" ).click(function() {
        adjustSupply(steel, -1);
        renderUI();
    });

    // Lithium
    $( ".box-item--lithium .box-item-buttons .plus" ).click(function() {
        adjustSupply(lithium, 1);
        renderUI();
    });
    $( ".box-item--lithium .box-item-buttons .minus" ).click(function() {
        adjustSupply(lithium, -1);
        renderUI();
    });
}

function registerPlayerClickListeners() {
    $(".box-item--player-red .box-item-player-header .debt img").click(function() {
        toggleDebt(playerRed)
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        renderUI();
    });
    $(".box-item--player-blue .box-item-player-header .debt img").click(function() {
        toggleDebt(playerBlue)
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        renderUI();
    });

    $(".box-item--player-green .box-item-player-header .debt img").click(function() {
        toggleDebt(playerGreen)
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        renderUI();
    });

    $(".box-item--player-yellow .box-item-player-header .debt img").click(function() {
        toggleDebt(playerYellow)
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        renderUI();
    });
}

function renderDemand() {
    var demandText = function(demand) {
        return "Demand: " + demand;
    }

    var $demand_power = $(".box-item--power .box-item-demand p");
    var $demand_iron = $(".box-item--iron .box-item-demand p");
    var $demand_aluminium = $(".box-item--aluminium .box-item-demand p");
    var $demand_carbon = $(".box-item--carbon .box-item-demand p");
    var $demand_steel = $(".box-item--steel .box-item-demand p");
    var $demand_lithium = $(".box-item--lithium .box-item-demand p");

    $demand_power.text(demandText(power.demand));
    $demand_iron.text(demandText(iron.demand));
    $demand_aluminium.text(demandText(aluminium.demand));
    $demand_carbon.text(demandText(carbon.demand));
    $demand_steel.text(demandText(steel.demand));
    $demand_lithium.text(demandText(lithium.demand));
}

function renderPrice() {
    var priceText = function(price) {
        return price + "$";
    }

    var $price_power = $(".box-item--power .box-item-price h2");
    var $price_iron = $(".box-item--iron .box-item-price h2");
    var $price_aluminium = $(".box-item--aluminium .box-item-price h2");
    var $price_carbon = $(".box-item--carbon .box-item-price h2");
    var $price_steel = $(".box-item--steel .box-item-price h2");
    var $price_lithium = $(".box-item--lithium .box-item-price h2");

    $price_power.text(priceText(power.price));
    $price_iron.text(priceText(iron.price));
    $price_aluminium.text(priceText(aluminium.price));
    $price_carbon.text(priceText(carbon.price));
    $price_steel.text(priceText(steel.price));
    $price_lithium.text(priceText(lithium.price));
}

function renderSupply() {
    var supplyText = function(demand) {
        return "Supply: " + demand;
    }
    var $supply_power = $(".box-item--power .box-item-supply p");
    var $supply_iron = $(".box-item--iron .box-item-supply p");
    var $supply_aluminium = $(".box-item--aluminium .box-item-supply p");
    var $supply_carbon = $(".box-item--carbon .box-item-supply p");
    var $supply_steel = $(".box-item--steel .box-item-supply p");
    var $supply_lithium = $(".box-item--lithium .box-item-supply p");

    $supply_power.text(supplyText(power.supply));
    $supply_iron.text(supplyText(iron.supply));
    $supply_aluminium.text(supplyText(aluminium.supply));
    $supply_carbon.text(supplyText(carbon.supply));
    $supply_steel.text(supplyText(steel.supply));
    $supply_lithium.text(supplyText(lithium.supply));

}

function renderPlayerIncome() {
    var incomeText = function(income) {
        return income + "$";
    }

    var $income_red = $(".box-item--player-red .income");
    var $income_blue = $(".box-item--player-blue .income");
    var $income_green = $(".box-item--player-green .income");
    var $income_yellow = $(".box-item--player-yellow .income");

    $income_red.text(incomeText(getIncome(playerRed)));
    $income_blue.text(incomeText(getIncome(playerBlue)));
    $income_green.text(incomeText(getIncome(playerGreen)));
    $income_yellow.text(incomeText(getIncome(playerYellow)));
}

function renderPlayerDebt() {
    var debtText = function(debt) {
        return debt + "$";
    }

    var $debt_red = $(".box-item--player-red .debt .center div");
    var $debt_blue = $(".box-item--player-blue .debt .center div");
    var $debt_green = $(".box-item--player-green .debt .center div");
    var $debt_yellow = $(".box-item--player-yellow .debt .center div");

    $debt_red.text(debtText(playerRed.debt));
    $debt_blue.text(debtText(playerBlue.debt));
    $debt_green.text(debtText(playerGreen.debt));
    $debt_yellow.text(debtText(playerYellow.debt));
}

function renderUI() {
    renderDemand();
    renderPrice();
    renderSupply();
    renderPlayerIncome();
    renderPlayerDebt();
}

$(document).ready(function() {
    initialize();
    registerMarketClickListeners();
    registerPlayerClickListeners();
    renderUI();
    console.log(power.price);
});