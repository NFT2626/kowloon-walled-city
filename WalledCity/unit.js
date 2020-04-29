class Unit{
    constructor(node, tower, clock, bank_account) {
        this.node = node;
        this.tower = tower;
        this.clock = clock;
        this.bank_account = bank_account;
        this.neighbors = new Neighbor(this.node, this.tower);
        this.utils = new DrawUtils();
    }

    draw(){
        if(this.canConstructAboveGround()) {
            if (this.neighbors.southernNeighbor().type !== null) {
                if (this.neighbors.southernNeighbor().type !== "entrance" &&
                    this.neighbors.southernNeighbor().type !== "balcony") {
                    this.node.domElement.className = "node";
                    this.node.domElement.classList.add("empty");
                    this.node.type = "empty";
                    this.bank_account.withdraw(5000);

                    if (this.neighbors.easternNeighbor().type === null) {
                        this.neighbors.easternNeighbor().domElement.classList.add('balcony-top-east');
                        this.neighbors.easternNeighbor().type = "balcony";

                        if (this.neighbors.southEasternNeighbor().domElement.classList[1] === 'balcony-top-east') {
                            this.neighbors.southEasternNeighbor().domElement.classList.remove('balcony-top-east');
                            this.neighbors.southEasternNeighbor().domElement.classList.add('balcony-east');
                        }
                    } else if (this.neighbors.easternNeighbor().domElement.classList[1].includes("balcony")) {
                        this.neighbors.easternNeighbor().domElement.className = "node";
                        this.neighbors.easternNeighbor().domElement.classList.add("clothes-line-n2n");
                        this.neighbors.easternNeighbor().type = "clothes-line";
                    }

                    if (this.neighbors.westernNeighbor().domElement.classList.length === 1) {
                        this.neighbors.westernNeighbor().domElement.classList.add('balcony-top-west');
                        this.neighbors.westernNeighbor().type = "balcony";

                        if (this.neighbors.southWesternNeighbor().domElement.classList[1] === 'balcony-top-west') {
                            this.neighbors.southWesternNeighbor().domElement.classList.remove('balcony-top-west');
                            this.neighbors.southWesternNeighbor().domElement.classList.add('balcony-west');
                        }
                    } else if (this.neighbors.westernNeighbor().domElement.classList[1].includes("balcony")) {
                        this.neighbors.westernNeighbor().domElement.className = "node";
                        this.neighbors.westernNeighbor().domElement.classList.add("clothes-line-n2n");
                        this.neighbors.westernNeighbor().type = "clothes-line";
                    }
                }
            }
        }
        if(this.canConstructUnderground()){
            if(this.neighbors.northernNeighbor().domElement.classList[1] && this.node.floor_id < 6){

                this.node.domElement.className = "node";
                this.node.domElement.classList.add("empty-basement");
                this.node.type = "empty-basement";
                this.utils.removeBackgroundImages(this.node);
                this.bank_account.withdraw(5000);

                if(this.neighbors.southernNeighbor().type === null ||
                    this.neighbors.southernNeighbor().type === "basement"){
                    this.utils.addBackgroundImage(this.neighbors.southernNeighbor(), "img/rooms/basement-bg.png");
                }

                if(this.neighbors.easternNeighbor().type === "basement" ||
                    this.neighbors.easternNeighbor().type === "entrance" ||
                    this.neighbors.easternNeighbor().type === null){
                    this.utils.addBackgroundImage(this.neighbors.easternNeighbor(), "img/rooms/basement-wall-east.png");
                    this.utils.addBackgroundImage(this.neighbors.southEasternNeighbor(), "img/rooms/basement-wall-southeast.png");
                    this.neighbors.easternNeighbor().type = "basement";
                    this.neighbors.southEasternNeighbor().type = "basement";

                } else if(this.neighbors.easternNeighbor().domElement.classList[1].includes('wall')){
                    this.utils.addBackgroundImage(this.neighbors.easternNeighbor(), "img/rooms/basement-wall-n2n.png");
                    this.neighbors.easternNeighbor().type = "basement";
                }

                if(this.neighbors.westernNeighbor().type === "basement" ||
                    this.neighbors.westernNeighbor().type === "entrance" ||
                    this.neighbors.westernNeighbor().type === null){
                    this.utils.addBackgroundImage(this.neighbors.westernNeighbor(), "img/rooms/basement-wall-west.png");
                    this.utils.addBackgroundImage(this.neighbors.southWesternNeighbor(), "img/rooms/basement-wall-southwest.png");
                    this.neighbors.westernNeighbor().type = "basement";
                    this.neighbors.southWesternNeighbor().type = "basement";

                } else if(this.neighbors.westernNeighbor().domElement.classList[1].includes('wall')){
                    this.utils.addBackgroundImage(this.neighbors.westernNeighbor(), "img/rooms/basement-wall-n2n.png");
                }
            }
        }

        this.isConnected();
        this.collectRent();
    }

    isConnected(){
        let self = this;
        setInterval(function () {
            if(!self.checkLobbyConnection()){
                self.warnRow(self.node);
            }
        }, 5000)
    }

    collectRent(){
        let self = this;
        setInterval(function () {
            switch(self.node.type){
                case "residential-occupied":
                    self.bank_account.deposit(15);
                    break;
                case "commercial-occupied":
                    self.bank_account.deposit(30);
                    break;
                case "industrial-occupied":
                    self.bank_account.deposit(50);
                    break;
                default:
                    break;
            }
        }, 30000);
    }

    checkLobbyConnection(){
        // Above ground units
        if(this.node.type !== null && this.node.type !== "lobby" &&
                (this.neighbors.westernNeighbor().type === "balcony" ||
                    this.neighbors.westernNeighbor().type === "clothes-line")){

            let lobby = this.traverseToLobby(this.node, "south");
            let route = new Route(this.tower);
            return route.traverse(this.node, lobby).length > 0;
        }

        // Below ground units
        if(this.node.type !== null && this.node.type !== "lobby" &&
            this.neighbors.westernNeighbor().type === "basement"){
            let lobby = this.traverseToLobby(this.node, "north");
            let route = new Route(this.tower);
            return route.traverse(this.node, lobby).length > 0;
        }
        return true
    }

    warnRow(node){
        let neighbors = new Neighbor(node, this.tower);
        if(node.type === "balcony" || node.type === "clothes-line" || node.type === "basement"){
            return true;
        }

        node.domElement.classList.add("no-lobby");
        setTimeout(function () {
            node.domElement.classList.remove("no-lobby");
        }, 500);

        return this.warnRow(neighbors.easternNeighbor());

    }

    traverseToLobby(node, direction){
        let neighbors = new Neighbor(node, this.tower);

        if(neighbors.westernNeighbor().type === "entrance"){
            return node;
        }

        if(node.floor_id === 6){
            if(neighbors.westernNeighbor() !== "entrance"){
                return this.traverseToLobby(neighbors.westernNeighbor(), direction);
            }
        }

        if(direction === "south"){
            return this.traverseToLobby(neighbors.southernNeighbor(), direction);
        } else {
            return this.traverseToLobby(neighbors.northernNeighbor(), direction);
        }
    }

    canConstructAboveGround(){
        return !!(this.neighbors.northernNeighbor() &&
            this.neighbors.southernNeighbor() &&
            this.neighbors.easternNeighbor() &&
            this.neighbors.westernNeighbor() &&
            this.node.floor_id > 6 &&
            !this.isOccupied()
        )
    }

    canConstructUnderground(){
        return !!(this.neighbors.northernNeighbor() &&
            this.neighbors.southernNeighbor() &&
            this.neighbors.easternNeighbor() &&
            this.neighbors.westernNeighbor() &&
            !this.isOccupied() &&
            this.neighbors.northernNeighbor().domElement.classList[1] &&
            !this.neighbors.northernNeighbor().domElement.classList[1].includes("entrance") &&
            this.node.floor_id < 6
        )
    }

    isOccupied(){
        if(this.node.domElement.classList.length > 1){
            if(this.node.domElement.classList[1].includes("occupied") ||
                this.node.type === "empty" ){
                return true;
            }
        }
        return false;
    }
}