declare module "amadeus" {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: any;
    referenceData: any;
  }

  export = Amadeus;
}
