export class Resource {
    name: string;
    username: string;
    id: string | undefined;

    constructor(
        name = '',
        username = '',
        id: string | undefined = undefined
    ) {
        this.name = name;
        this.username = username;
        this.id = id;
    }
}