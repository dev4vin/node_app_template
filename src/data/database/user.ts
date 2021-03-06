import makeUser, { UserType, VALIDATOR_SCENARIOS } from "@domain/user";
import serializer from "@data/serializer";
import UserDatabase from "@data/user";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column()
    names!: string;

    @Column()
    email!: string;

    @Column()
    phone_number!: string;

    @Column()
    admin!: boolean;

}

const userSerializer = serializer((user: User): UserType => {
    return {
        id: user.id === undefined ? "0" : user.id.toString(),
        names: user.names,
        email: user.email,
        phone_number: user.phone_number,
        admin: user.admin
    };
})


const userDeserializer = serializer((user: UserType): User => {
    const passedUser = makeUser(user, VALIDATOR_SCENARIOS.CREATE_USER)
    const newUser = new User();
    newUser.id = undefined
    newUser.names = passedUser.names
    newUser.email = passedUser.email
    newUser.phone_number = passedUser.phone_number
    newUser.admin = passedUser.admin
    return newUser;
})

export default class MysqlUserDatabase implements UserDatabase {

    deleteUser(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return User.delete(id)
                .then(_ => resolve(true))
                .catch(err => reject(err))
        })
    }

    deleteAllUsers(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            User.clear().then(_ => resolve(true))
                .catch(err => reject(err))
        })
    }

    addUser(user: UserType): Promise<UserType> {
        return new Promise<UserType>((resolve, reject) => {
            userDeserializer(user).save()
                .then((u: any) => resolve(userSerializer(u)))
                .catch((err: any) => reject(err))
        })
    }

    findUser(prop: string, val: any): Promise<any> {
        return new Promise<UserType>((resolve, reject) => {
            if (prop === 'id') {
                prop = '_id'
            }
            User.find({ [prop]: val })
                .then(resp => {
                    resolve(userSerializer(resp[0]))
                }).catch(err => reject(err))
        })
    }

    findUsers(): Promise<UserType[]> {
        return new Promise<UserType[]>((resolve, reject) => {
            User.find({})
                .then(data => resolve(userSerializer(data)))
                .catch(err => reject(err))
        })
    }
}

