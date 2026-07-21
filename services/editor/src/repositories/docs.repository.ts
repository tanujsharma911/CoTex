import mongoose from "mongoose";
import { Docs, type docType } from "../models/docs.model.js";

class DocsRepository {
  public async createDoc(docData: Partial<docType>): Promise<docType | null> {
    const doc = new Docs(docData);

    return doc.save();
  }

  public async getDoc(docId: string): Promise<docType | null> {
    const id = new mongoose.Types.ObjectId(docId);

    return await Docs.findById(id);
  }

  public async updateDoc(
    docId: string,
    updateData: Partial<docType>,
  ): Promise<docType | null> {
    const id = new mongoose.Types.ObjectId(docId);

    return await Docs.findOneAndUpdate({ _id: id }, updateData, {
      returnDocument: "after",
    });
  }

  public async deleteDoc(docId: string): Promise<docType | null> {
    return await Docs.findOneAndUpdate(
      { _id: docId },
      { deleted: true },
      { returnDocument: "after" },
    );
  }

  //TODO: test this what it returns
  public async getDocsByUserId(userId: string): Promise<docType[]> {
    return await Docs.find({ ownerId: userId });
  }
}

export { DocsRepository };
