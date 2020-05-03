class Crime{
    constructor(node, tower) {
        this.node = node;
        this.tower = tower;
        this.neighbors = new Neighbor(this.node, this.tower);
        this.influence = new CircleArea(2, this.node, this.tower).contents;
        this.residence_utils = new ResidenceUtils();
        this.random_utils = new RandomUtils();

        this.init();
    }

    init(){
        let self = this;
        setInterval(function () {
            self.start();
            if(self.tower.getCrime(self.node)){
                self.forceOutNeighbor();
                self.stop();
            }
        }, 15000);

        setInterval(function () {
            if(self.tower.getCrime(self.node)){
                self.spread();
            }
        }, 10000)

    }

    start(){
        if(this.canHaveCrime(this.node)){
            let unemployment = 0;

            let eastern_neighbor = this.tower.getTenant(this.neighbors.easternNeighbor());
            let western_neighbor = this.tower.getTenant(this.neighbors.westernNeighbor());
            let southern_neighbor = this.tower.getTenant(this.neighbors.westernNeighbor());
            let northern_neighbor = this.tower.getTenant(this.neighbors.northernNeighbor());

            if(typeof eastern_neighbor !== "undefined" && eastern_neighbor.isUnemployed()){
                unemployment += 1;
            }
            if(typeof western_neighbor !== "undefined" && western_neighbor.isUnemployed()){
                unemployment += 1;
            }
            if(typeof southern_neighbor !== "undefined" && southern_neighbor.isUnemployed()){
                unemployment += 1;
            }
            if(typeof northern_neighbor !== "undefined" && northern_neighbor.isUnemployed()){
                unemployment += 1;
            }

            if( unemployment >= 2){
                if(this.random_utils.randomInRange(0, 9) === 0){
                    this.node.domElement.innerHTML = '<div id="'+this.node.domElement.id+'" class="crime"></div>';
                    this.removeJob(this.node);
                    return this.tower.addCrime(this);
                }
            }
        }
    }

    stop(){
        if(typeof this.tower.getCrime(this.node) !== "undefined"){
            if(this.random_utils.randomInRange(0, 26) === 0){
                this.node.domElement.innerHTML = "";
                return this.tower.removeCrime(this);
            }
        }
    }

    spread(){
        let spread = this.random_utils.randomInRange(0, 4) === 0;
        if(spread){
            let neighbors = ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"];
            let random_neighbor = this.random_utils.randomInArray(neighbors);
            let spread_to = null;
            switch(random_neighbor){
                case "north":
                    spread_to =  this.neighbors.northernNeighbor();
                    break;
                case "south":
                    spread_to =  this.neighbors.southernNeighbor();
                    break;
                case "east":
                    spread_to =  this.neighbors.easternNeighbor();
                    break;
                case "west":
                    spread_to =  this.neighbors.westernNeighbor();
                    break;
                case "northeast":
                    spread_to =  this.neighbors.northEasternNeighbor();
                    break;
                case "northwest":
                    spread_to =  this.neighbors.northWesternNeighbor();
                    break;
                case "southeast":
                    spread_to =  this.neighbors.southEasternNeighbor();
                    break;
                case "southwest":
                    spread_to =  this.neighbors.southWesternNeighbor();
                    break;
            }

            if(this.canHaveCrime(spread_to)){
                let neighbor = this.tower.getTenant(spread_to);
                if(neighbor){
                    let new_crime = new Crime(neighbor.home, this.tower);
                    this.tower.addCrime(new_crime);
                    neighbor.home.domElement.innerHTML = '<div id="'+neighbor.home.domElement.id+'" class="crime"></div>';
                    this.removeJob(this.node);
                }
            }
        }
    }

    forceOutNeighbor(){
        if(this.tower.getCrime(this.node)){
            let random_neighbor = this.tower.getTenant(this.random_utils.randomInArray(this.influence));
            if(this.random_utils.randomInRange(0,4) === 0 && random_neighbor && random_neighbor !== this.node){
                this.residence_utils.abandon(random_neighbor.home, this.tower);
            }
        }
    }

    removeJob(node){
        let tenant = this.tower.getTenant(node);
        if(tenant){
            let job = this.tower.getTenantsJob(tenant);
            if(job){
                job.removeWorker(this.tower.getTenant(node));
            }
        }
    }

    canHaveCrime(node){
        return typeof node &&
            typeof this.tower.getCrime(node) === "undefined" &&
            node.type !== null &&
            node.type.includes("occupied");
    }
}