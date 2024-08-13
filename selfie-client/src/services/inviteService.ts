import axios from 'axios';
import {Invite} from '@/models/Invite';

const API_URL = process.env.VUE_APP_API_URL + '/invite';

const formatInvite = (invite: any) => {
    return {
        ...invite,
        answerDate: new Date(invite.answerDate)
    }
}

const getPendingInvitesByUser = async (username: string, date?: Date) => {
    try {
        let url = `${API_URL}/user/${username}`;
        if(date){
            url += `?date=${date.toISOString()}`;
        }
        const response = await axios.get(url, { withCredentials: true });
        return response.data.map((invite: any) => formatInvite(invite));
    } catch (error: any) {
        throw error.response.data;
    }
}

const acceptInvite = async (invite: Invite) => {
    try{
        await axios.post(`${API_URL}/accept/${invite.id}`, {invite}, { withCredentials: true });
    }
    catch(error:any){
        throw error.response.data;
    }
}

const declineInvite = async (invite: Invite) => {
    try{
        await axios.post(`${API_URL}/decline/${invite.id}`, {invite}, { withCredentials: true });
    }
    catch(error:any){
        throw error.response.data;
    }
}

const postponeInvite = async (invite: Invite) => {
    try{
        await axios.post(`${API_URL}/postpone/${invite.id}`, {invite}, { withCredentials: true });
    }
    catch(error:any){
        throw error.response.data;
    }
}

export default{
    getPendingInvitesByUser,
    acceptInvite,
    declineInvite,
    postponeInvite,
}