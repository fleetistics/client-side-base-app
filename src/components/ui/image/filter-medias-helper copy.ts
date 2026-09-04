import { SelectedMedia } from "@/app.Commons/model/uploaded-media";

export class FilterMediaHelper {
    static HasMediaByGroup(medias?: SelectedMedia[], groupKey?: number): boolean {
        //console.log(`UploadedMediaHelper::HasMediaByGroup groupKey [${groupKey}]`, medias);
        if (!medias) return false;
        else {
            for (let i = 0, len = medias.length; i < len; i++) {
                let e = medias[i];
                if (!e.isDeleted) {
                    if (!groupKey && !e.GroupKey) return true;
                    else if (!groupKey && !e.GroupKey ) return true;
                    else if (groupKey && groupKey == e.GroupKey) return true;                    
                }
            }
            return false;
        }
    }
    static FilterMediaByGroup(medias?: SelectedMedia[], groupKey?: number): SelectedMedia[] | undefined {
        if (!medias) return undefined;
        else {
            let res = medias.filter((e: SelectedMedia) => {
                //console.log(`FilterMediaByGroup [${groupKey}]  ${(e.status == MediaStatus.Deleted)} ${JSON.stringify(e)}`);
                if (e.isDeleted) return false;
                else if (!groupKey && !e.GroupKey) return e;
                else if (groupKey && groupKey == e.GroupKey) {
                    return e;
                }
                else return false;
            });
            //console.log(`FilterMediaByGroup [${groupKey}] [${groupName}] ${res.length}`);
            if (res.length == 0) return undefined;
            else return res;
        }
    }
    static RemoveSingleMedia(item: SelectedMedia, medias?: SelectedMedia[]): SelectedMedia[] | undefined {
        if (!medias) return undefined;
        else {
            let res = medias.filter((e: SelectedMedia) => {
                if (item.Id && e.Id ) {
                    if (item.Id != e.Id) return e;
                    else return false
                } else {
                    if (e.isDeleted) return e;
                    else if (item.Url != e.Url) return e;
                    else return false;
                }
            });
            if (res.length == 0) return undefined;
            else return res;
        }
    }    
    static RemoveAllGroupMedia(medias?: SelectedMedia[], groupKey?: number ): SelectedMedia[] | undefined {
        if (!medias) return undefined;
        else {
            let res = medias.filter((e: SelectedMedia) => {
                if (e.isDeleted) return e;
                else if (!groupKey && !e.GroupKey) return false;
                else if (groupKey && groupKey == e.GroupKey) {
                    return false;
                }
                else return e;
            });
            if (res.length == 0) return undefined;
            else return res;
        }
    }     
}