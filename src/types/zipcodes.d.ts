declare module "zipcodes" {
    interface ZipRecord {
        zip: string;
        latitude: number;
        longitude: number;
        city: string;
        state: string;
        country: string;
    }

    interface ZipcodesApi {
        lookupByState(state: string): ZipRecord[];
    }

    const zipcodes: ZipcodesApi;
    export default zipcodes;
}
