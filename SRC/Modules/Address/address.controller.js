import Address from "../../../DB/Models/address.model.js";
import { errorHandlerClass } from "../../utils/error-class.utils.js";
import User from "../../../DB/Models/user.model.js";


////////////////////////////////add address /////////////////////////////////////////////
export const addAddress =async(req,res,next) => {
    const userId=req.authUser._id;
    const{country, city ,buildingNumber,floorNumber,addressLabel,setAsDefault} = req.body;

    const newAddress = new Address({
        userId,
        country,
        city,
        buildingNumber,
        floorNumber,
        addressLabel,
        isDefault :[true,false].includes(setAsDefault) ? setAsDefault : false
    });

        const address =await newAddress.save();
        if(!address){
            return next(new errorHandlerClass("Failed to add address",500,"Failed to add address"))
        }

        await User.updateOne(
            { _id: userId },
            { $push: { addresses: address._id } } // Add the address ID to the user's addresses array
        );

        res.status(201).json({message:"Address added successfully",address});

}

//////////////////////////////// edit addresses  ////////////////////////////////////

export const editAddress = async (req, res, next) => {
    const {addressId}= req.params;
    const userId=req.authUser._id;

    const {country, city ,buildingNumber,floorNumber,addressLabel,setAsDefault} = req.body;

    const address = await Address.findOne({_id: addressId, userId});

    if (!address) {
        return next(new errorHandlerClass("Address not found", 404, "Address not found"));
    }

    if(country) address.country=country;
    if(city) address.city=city;
    if(buildingNumber) address.buildingNumber=buildingNumber;
    if(floorNumber) address.floorNumber=floorNumber;
    if(addressLabel) address.addressLabel=addressLabel;
    if([true,false].includes(setAsDefault)){
        address.isDefault=[true,false].includes(setAsDefault) ? setAsDefault : false;
        await Address.updateOne({userId,isDefault:true},{isDefault:false});
    }

    const updatedAddress=await address.save();
    console.log(updatedAddress);
    
    if (!updatedAddress) {
        return next(new errorHandlerClass("Error in updating the address", 404, "Error in updating the address"));
    }
    res.json({ message: "Address updated successfully", address });
};

//////////////////////////////// delete address  ////////////////////////////////////

export const deleteAddress = async (req, res, next) => {
    const {addressId}= req.params;
    const userId=req.authUser._id;

    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
        return next(new errorHandlerClass("Address not found", 404, "Address not found"));
    }

    // Remove the reference from the user's addresses array
    await User.updateOne({ _id: userId }, { $pull: { addresses: addressId } });
    
    res.json({ message: "Address deleted successfully" });
};

////////////////////////////////get all user addresses ///////////////////////////////////

export const getAllAddresses = async (req, res, next) => {
    const userId=req.authUser._id;

    const addresses = await Address.find({userId});

    if (addresses.length === 0) {
        return next(new errorHandlerClass("No addresses found", 404, "No addresses found"));
    }
    res.json({ message: "Addresses fetched successfully", addresses });
};