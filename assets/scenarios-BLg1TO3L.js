var e=[{title:{en:`Idle uplink at the Surat warehouse`,hi:`Surat warehouse ka idle uplink`},ticket:{en:`Monitoring shows all traffic of ACC7 on the link to AGG1. The link to AGG2 is idle. AGG1 and AGG2 were designed to root MSTI 1 and MSTI 2. Read the output from ACC7 and AGG1.`,hi:`Monitoring mein ACC7 ka saara traffic AGG1 wale link par hai. AGG2 wala link idle hai. AGG1 aur AGG2 ko MSTI 1 aur MSTI 2 ka root banana tha. ACC7 aur AGG1 ka output padho.`},out:`lab@ACC7> show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : 4
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@AGG1> show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : 3
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@ACC7> show spanning-tree interface msti 2
Interface     Port ID  Designated  Designated         Port   State  Role
ge-0/0/0      128:1    128:2       4096.525426341d00  20000  FWD    MSTR (Boundary)
ge-0/0/1      128:2    128:2       8192.525423341900  20000  BLK    ALT (Boundary)`,q:{en:`What is the cause?`,hi:`Kaaran kya hai?`},o:[{en:`ge-0/0/1 is administratively disabled`,hi:`ge-0/0/1 administratively disabled hai`},{en:`The VLAN mapping differs, which shows in the digest`,hi:`VLAN mapping alag hai, jo digest mein dikhta hai`},{en:`ACC7 has a different revision level, so it is in its own region and all MSTIs follow the CIST`,hi:`ACC7 ka revision level alag hai, isliye woh apne region mein hai aur saare MSTIs CIST follow karte hain`},{en:`AGG2 has priority 0 in every instance`,hi:`AGG2 ki har instance mein priority 0 hai`}],a:2,w:{en:`The digest is identical, so the mapping is the same. Revision 4 against 3 makes ACC7 a separate region; the Boundary flags and MSTR role show the instances collapsing onto the CIST.`,hi:`Digest identical hai, isliye mapping same hai. Revision 4 aur 3 ACC7 ko alag region bana deta hai; Boundary flags aur MSTR role dikhate hain ki instances CIST par collapse ho gaye.`}},{title:{en:`Who roots MSTI 2?`,hi:`MSTI 2 ka root kaun?`},ticket:{en:`After fixing the revision, ACC7 uses ge-0/0/0 for both instances. You expected MSTI 2 on ge-0/0/1. AGG1 has msti 2 priority 8k, AGG2 has 16k. What do you change?`,hi:`Revision theek karne ke baad ACC7 dono instances ke liye ge-0/0/0 use karta hai. Aap MSTI 2 ko ge-0/0/1 par expect kar rahe the. AGG1 ki msti 2 priority 8k, AGG2 ki 16k hai. Kya badloge?`},out:`lab@ACC7> show spanning-tree interface msti 2
Interface     Port ID  Designated  Designated         Port   State  Role
ge-0/0/0      128:1    128:2       8194.525426341d00  20000  FWD    ROOT
ge-0/0/1      128:2    128:2       16386.525423341900 20000  BLK    ALT`,q:{en:`Which change gives load sharing?`,hi:`Kaunsa change load sharing deta hai?`},o:[{en:`set protocols mstp msti 2 bridge-priority 4k on AGG2`,hi:`AGG2 par set protocols mstp msti 2 bridge-priority 4k`},{en:`set protocols mstp msti 2 bridge-priority 4k on ACC7`,hi:`ACC7 par set protocols mstp msti 2 bridge-priority 4k`},{en:`set protocols mstp revision-level 5 on AGG2 only`,hi:`Sirf AGG2 par set protocols mstp revision-level 5`},{en:`set protocols mstp interface ge-0/0/0 edge on ACC7`,hi:`ACC7 par set protocols mstp interface ge-0/0/0 edge`}],a:0,w:{en:`Lower priority wins. Giving AGG2 4k makes it the MSTI 2 regional root (shown as 4098) and ACC7 will pick ge-0/0/1 as root port. Changing the access switch or the revision would break things.`,hi:`Chhoti priority jeetti hai. AGG2 ko 4k dene se woh MSTI 2 ka regional root ban jaata hai (4098 dikhta hai) aur ACC7 ge-0/0/1 ko root port chunega. Access switch ya revision badalne se cheezein bigad jaayengi.`}},{title:{en:`V30 root is the access switch`,hi:`V30 ka root access switch hai`},ticket:{en:`At the Kolkata branch nobody set VSTP priorities. A user reports that V30 traffic from DIST-B crosses an access switch. Read the output from ACC-3.`,hi:`Kolkata branch mein kisi ne VSTP priorities set nahi kin. Ek user bataata hai ki DIST-B se V30 ka traffic access switch se hokar jaata hai. ACC-3 ka output padho.`},out:`lab@ACC-3> show spanning-tree bridge vlan V30
STP bridge parameters for VLAN 30
  Root ID                           : 32798.52:54:9e:49:10:00
  Local parameters
    Bridge ID                       : 32798.52:54:9e:49:10:00
    Extended system ID              : 30`,q:{en:`What does the output prove?`,hi:`Output kya sabit karta hai?`},o:[{en:`A DIST switch is root of V30`,hi:`Koi DIST switch V30 ka root hai`},{en:`The priority is 30`,hi:`Priority 30 hai`},{en:`V30 has no spanning tree`,hi:`V30 ka koi spanning tree nahi`},{en:`ACC-3 is root of V30 because Root ID equals its own Bridge ID`,hi:`ACC-3 V30 ka root hai kyunki Root ID uske apne Bridge ID ke barabar hai`}],a:3,w:{en:`Root ID equals Bridge ID, so this switch is the root. 32798 is 32768 plus VLAN 30. Set 4k on DIST-B and 8k on DIST-A for V30.`,hi:`Root ID = Bridge ID, matlab yeh switch root hai. 32798 = 32768 + VLAN 30. V30 ke liye DIST-B par 4k aur DIST-A par 8k set karo.`}},{title:{en:`Steering V20 without moving the root`,hi:`Root hilaye bina V20 ko steer karna`},ticket:{en:`The inspection appliance sits behind DIST-B. Only V20 must cross it. You set cost 50000 on ACC-3 ge-0/0/0 in VLAN 20. Read the result.`,hi:`Inspection appliance DIST-B ke peeche hai. Sirf V20 ko usse guzarna hai. Aapne ACC-3 ge-0/0/0 par VLAN 20 mein cost 50000 set kiya. Result padho.`},out:`lab@ACC-3> show spanning-tree interface vlan V20
Interface     Port ID  Designated  Designated         Port   State  Role
ge-0/0/0      128:1    128:2       4116.5254ca765000  50000  BLK    ALT
ge-0/0/1      128:2    128:2       8212.5254cb765200  20000  FWD    ROOT

lab@ACC-3> show spanning-tree bridge vlan V20
  Root ID                           : 4116.52:54:ca:76:50:00
  Root cost                         : 40000
  Root port                         : ge-0/0/1`,q:{en:`Why is the root cost 40000?`,hi:`Root cost 40000 kyun hai?`},o:[{en:`The configured cost 50000 minus 10000`,hi:`Configured cost 50000 minus 10000`},{en:`20000 to DIST-B plus 20000 from DIST-B to the root DIST-A`,hi:`20000 DIST-B tak plus 20000 DIST-B se root DIST-A tak`},{en:`Two times the default cost of ge-0/0/0`,hi:`ge-0/0/0 ke default cost ka double`},{en:`DIST-B is the root of V20`,hi:`DIST-B V20 ka root hai`}],a:1,w:{en:`DIST-A (4116) is still root. The path via DIST-B costs 20000 + 20000 = 40000, which beats the direct link at 50000, so ge-0/0/1 becomes the root port.`,hi:`DIST-A (4116) abhi bhi root hai. DIST-B wale path ka cost 20000 + 20000 = 40000 hai, jo 50000 wale direct link se behtar hai, isliye ge-0/0/1 root port ban jaata hai.`}},{title:{en:`Reading the tree from a bridge ID`,hi:`Bridge ID se tree padhna`},ticket:{en:`A colleague pastes a line from an access switch and asks which tree and which priority it shows.`,hi:`Ek colleague access switch ki ek line paste karke poochhta hai ki yeh kaunsa tree aur kaunsi priority dikhata hai.`},out:`lab@ACC7> show spanning-tree interface msti 1
Interface     Port ID  Designated  Designated         Port   State  Role
ge-0/0/0      128:1    128:2       4097.525426341d00  20000  FWD    ROOT`,q:{en:`What does the designated bridge ID 4097 mean?`,hi:`Designated bridge ID 4097 ka kya matlab hai?`},o:[{en:`Priority 4097 in the CIST`,hi:`CIST mein priority 4097`},{en:`Priority 4k plus extended system ID 1, so the regional root of MSTI 1 is a 4k switch`,hi:`Priority 4k plus extended system ID 1, yaani MSTI 1 ka regional root 4k wala switch hai`},{en:`VLAN 97 with priority 4k`,hi:`VLAN 97 priority 4k ke saath`},{en:`Port cost 4097`,hi:`Port cost 4097`}],a:1,w:{en:`The instance number is added to the priority: 4096 + 1 = 4097. A CIST priority would be a plain multiple of 4096.`,hi:`Instance number priority mein jud jaata hai: 4096 + 1 = 4097. CIST priority 4096 ka seedha multiple hoti.`}},{title:{en:`Meeting-room PC takes down the floor`,hi:`Meeting-room PC poora floor gira deta hai`},ticket:{en:`A visitor connected a small unmanaged switch to two wall ports. The floor loses connectivity for a minute at a time. Wall ports ge-0/0/2 and ge-0/0/3 are edge ports but there is no BPDU protection. What do you configure?`,hi:`Ek visitor ne chhota unmanaged switch do wall ports mein laga diya. Floor ka connectivity ek-ek minute ke liye jaata hai. Wall ports ge-0/0/2 aur ge-0/0/3 edge ports hain par BPDU protection nahi hai. Kya configure karoge?`},out:`lab@ACC7> show configuration protocols mstp
interface ge-0/0/2 {
    edge;
}
interface ge-0/0/3 {
    edge;
}
configuration-name NK-SURAT;
revision-level 3;
msti 1 {
    vlan 10;
}
msti 2 {
    vlan 20;
}`,q:{en:`Which configuration best protects such ports?`,hi:`Aise ports ko sabse achhi tarah kaunsi configuration bachati hai?`},o:[{en:`revision-level 4 on ACC7`,hi:`ACC7 par revision-level 4`},{en:`msti 3 vlan 30`,hi:`msti 3 vlan 30`},{en:`no-root-port on the uplinks`,hi:`Uplinks par no-root-port`},{en:`edge on the wall ports plus bpdu-block-on-edge`,hi:`Wall ports par edge plus bpdu-block-on-edge`}],a:3,w:{en:`Edge with bpdu-block-on-edge shuts a wall port when it receives a BPDU from a switch. no-root-port belongs on downlinks, and changing the revision would split the region.`,hi:`Edge ke saath bpdu-block-on-edge wall port ko tab shut kar deta hai jab use switch ka BPDU milta hai. no-root-port downlinks par lagta hai, aur revision badalne se region toot jaata hai.`}},{title:{en:`VLAN not in VSTP`,hi:`VLAN VSTP mein nahi`},ticket:{en:`A new VLAN 40 was added to the Kolkata trunks and gateways but traffic loops intermittently. VSTP is used. Read the configuration of ACC-3.`,hi:`Kolkata trunks aur gateways par naya VLAN 40 add hua par traffic kabhi-kabhi loop karta hai. VSTP use ho raha hai. ACC-3 ki configuration padho.`},out:`lab@ACC-3> show configuration protocols vstp
interface ge-0/0/2 {
    edge;
}
interface ge-0/0/3 {
    edge;
}
vlan V10;
vlan V20;
vlan V30;`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A vlan statement for VLAN 40 under protocols vstp`,hi:`protocols vstp ke neeche VLAN 40 ka vlan statement`},{en:`revision-level for VSTP`,hi:`VSTP ke liye revision-level`},{en:`A configuration-name`,hi:`Configuration-name`},{en:`msti 40`,hi:`msti 40`}],a:0,w:{en:`VSTP builds a tree only for the VLANs you list. VLAN 40 has no spanning tree on VSTP interfaces, so a loop is not prevented. VSTP has no region, name or revision.`,hi:`VSTP sirf unhi VLANs ka tree banata hai jo aap list karte ho. VLAN 40 ka VSTP interfaces par koi spanning tree nahi, isliye loop nahi rukta. VSTP mein region, name ya revision nahi hota.`}}];export{e as default};