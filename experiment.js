// 0xf86c01850c4b201000825208949cbfd6ebdb9cfcccd6b043f43e524583486d455e880490283b23ec8f768025a067da959a6d114d42016b5fb43ff8ae018efe6e4c784d40dfb2f2aad8fb2d4f6ca00b019b1e457b592e5bfd553e3b73742de625c7b65145494a57dbca17e5e9d842
// --------- v,r,s are stored here. after each a0
// 25
// a0 67da959a6d114d42016b5fb43ff8ae018efe6e4c784d40dfb2f2aad8fb2d4f6c  //32 bytes
// a0 0b019b1e457b592e5bfd553e3b73742de625c7b65145494a57dbca17e5e9d842

const txParams = {
  // everythign in hexadecomal format
  nonce: "0x01",
  // in hex 2 chars are 1 byte. half of byte is nibble.
  // 1 nibble=4bits=1byte. so in hex, 1 char is 1 nibble
  // original hex is C4B201000 for gasPrice which is 4.5 half bytes but we cannot pass 4.5 we have to make it 5 so we add a 0 to the left
  gasPrice: "0x0C4B201000",
  gasLimit: "0x5208",
  // address is 20 bytes
  to: "0x9cbfd6ebdb9cfcccd6b043f43e524583486d455e",
  value: "0x0490283B23EC8F76",
  // input data is emptyu for transaction
  data: "0x",
  v: "0x25",
  r: "0x67da959a6d114d42016b5fb43ff8ae018efe6e4c784d40dfb2f2aad8fb2d4f6c",
  s: "0x0b019b1e457b592e5bfd553e3b73742de625c7b65145494a57dbca17e5e9d842",
};
