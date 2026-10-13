var e={id:`interop-auth`,h:{en:`Junos and IOS side by side: commands, interoperability and authentication`,hi:`Junos aur IOS side by side: commands, interoperability aur authentication`},body:{en:`
<p><b>Speaking two dialects.</b> A real carrier engineer reads both Junos and IOS output without thinking. This chapter puts them side by side, summarises the interoperability rules you have seen in the labs, and adds IS-IS authentication, which matters for any core network. The command names in the first table are the ones used in this module. Authentication here is a <b>reference configuration (not run in the simulator)</b>.</p>
<table class="cmp"><tr><th>Task</th><th>Junos</th><th>IOS</th></tr><tr><td>Adjacencies</td><td>show isis adjacency</td><td>show isis neighbors</td></tr><tr><td>Interfaces and DIS</td><td>show isis interface</td><td>show isis neighbors detail; show clns interface</td></tr><tr><td>Database</td><td>show isis database</td><td>show isis database</td></tr><tr><td>Routes</td><td>show route (protocol shown as IS-IS/18)</td><td>show ip route isis (i L2, [115/metric])</td></tr><tr><td>Enable on a link</td><td>family iso on unit + protocols isis interface</td><td>ip router isis on interface</td></tr><tr><td>NET</td><td>family iso address on lo0</td><td>net under router isis</td></tr><tr><td>Level-2 only</td><td>level 1 disable</td><td>is-type level-2-only</td></tr><tr><td>Point-to-point</td><td>point-to-point per interface</td><td>isis network point-to-point</td></tr><tr><td>Wide metrics</td><td>level 2 wide-metrics-only</td><td>metric-style wide</td></tr><tr><td>Overload</td><td>overload [timeout n]</td><td>set-overload-bit [on-startup n]</td></tr></table>
<h3>Interoperability rules from the labs</h3>
<ul><li><b>Same level and same network type.</b> Both ends level 2, both point-to-point.</li>
<li><b>Compatible metrics.</b> IOS must read wide TLVs before Junos goes wide-only.</li>
<li><b>Area addresses.</b> Level 2 adjacencies do not require matching areas, but a single area value across the core (49.0300 in Lab 1) keeps the design simple. System IDs must be unique.</li>
<li><b>MTU.</b> IS-IS hellos are padded to the interface MTU on many platforms, so an MTU mismatch can leave an adjacency stuck even if both sides say up on the link.</li>
<li><b>Hostname.</b> Both vendors carry a dynamic hostname, so show output uses names (JR1, R1) instead of system IDs.</li></ul>
<h3>Authentication in the IS-IS core</h3>
<p>A core adjacency should be authenticated, so a rogue device on a link cannot join the IGP. On Junos you can authenticate hellos per interface and level, and LSPs and SNPs per level. A key mismatch keeps the adjacency from forming, or makes the router ignore LSPs. Compare the security chapter on IGP authentication in spcor-sp-security. All keys below are placeholders.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - Junos</span>
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-type md5
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key "PLACEHOLDER-KEY-1"
set protocols isis level 2 authentication-type md5
set protocols isis level 2 authentication-key "PLACEHOLDER-KEY-1"

<span class="c">! Reference configuration (not run in the simulator) - IOS neighbour</span>
key chain KC-ISIS
 key 1
  key-string PLACEHOLDER-KEY-1
interface GigabitEthernet0/0
 isis authentication mode md5 level-2
 isis authentication key-chain KC-ISIS level-2
router isis
 authentication mode md5 level-2
 authentication key-chain KC-ISIS level-2</pre>
<p>Hello authentication (per interface) stops a rogue router from forming an adjacency. LSP authentication (per level) stops forged database updates. Use both. Introduce authentication in a maintenance window on both ends of each link, because a one-sided change drops the adjacency.</p>
<h3>Features that grow around IS-IS in an SP core</h3>
<ul><li><b>BFD</b> for sub-second failure detection (reference only, not covered here).</li>
<li><b>LDP-IGP synchronisation</b>: do not use a link in IS-IS until LDP is up on it, to avoid black holes (see spcor-mpls-ldp). On Junos this is <code>ldp-synchronization</code> under the IS-IS interface.</li>
<li><b>Traffic engineering extensions</b>: wide metrics are the prerequisite.</li></ul>
<div class="eg"><p><b>Worked example.</b> A new Juniper-to-IOS link comes up with hello authentication on Junos only. Junos signs its hellos; IOS has no key, so it ignores them as invalid. The Junos side sees no hello from IOS and the adjacency never forms. Adding the same key chain on IOS fixes it. No change to IP addressing was needed.</p></div>
<div class="warn"><p><b>Common mistake.</b> Authenticating only one end, or using different algorithms or key IDs on the two vendors. Always list the algorithm, key and level on both ends in the change plan.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be able to translate between vendors: show isis adjacency versus show isis neighbors, level 1 disable versus is-type level-2-only, overload versus set-overload-bit, wide-metrics-only versus metric-style wide.</p></div>
<div class="scn"><h4>The hello nobody heard</h4><p>After a security change, a Junos to IOS adjacency fell and stayed down. The Junos engineer had enabled hello authentication; the IOS team had not been told. Applying the matching key chain on IOS in the same window brought the adjacency up in seconds.</p><p><b>Lesson:</b> Authentication changes are two-ended changes.</p></div>
<div class="iv"><p class="q">"Give the Junos and IOS commands for level-2 only IS-IS with wide metrics."</p><p>Junos: set protocols isis level 1 disable and set protocols isis level 2 wide-metrics-only, with family iso and the NET on lo0. IOS: router isis with net, is-type level-2-only and metric-style wide, and ip router isis on the interfaces. For links I use point-to-point on both vendors.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Know the command equivalents between Junos and IOS.</li>
<li>Interoperability needs the same level, network type and compatible metrics.</li>
<li>Authenticate hellos and LSPs; change both ends together.</li>
<li>LDP-IGP synchronisation prevents black holes (see spcor-mpls-ldp).</li>
<li>The authentication config here is reference only.</li></ul></div>
`,hi:`
<p><b>Do dialects bolna.</b> Real carrier engineer Junos aur IOS dono ka output bina soche padhta hai. Yeh chapter dono ko side by side rakhta hai, labs mein dekhe interoperability rules ka summary deta hai, aur IS-IS authentication jodta hai jo har core network ke liye zaroori hai. Pehli table ke command names wahi hain jo is module mein use hue. Yahan authentication <b>reference configuration (not run in the simulator)</b> hai.</p>
<table class="cmp"><tr><th>Task</th><th>Junos</th><th>IOS</th></tr><tr><td>Adjacencies</td><td>show isis adjacency</td><td>show isis neighbors</td></tr><tr><td>Interfaces aur DIS</td><td>show isis interface</td><td>show isis neighbors detail; show clns interface</td></tr><tr><td>Database</td><td>show isis database</td><td>show isis database</td></tr><tr><td>Routes</td><td>show route (protocol IS-IS/18 ke roop mein dikhta hai)</td><td>show ip route isis (i L2, [115/metric])</td></tr><tr><td>Link par enable</td><td>unit par family iso + protocols isis interface</td><td>interface par ip router isis</td></tr><tr><td>NET</td><td>lo0 par family iso address</td><td>router isis ke neeche net</td></tr><tr><td>Level-2 only</td><td>level 1 disable</td><td>is-type level-2-only</td></tr><tr><td>Point-to-point</td><td>per interface point-to-point</td><td>isis network point-to-point</td></tr><tr><td>Wide metrics</td><td>level 2 wide-metrics-only</td><td>metric-style wide</td></tr><tr><td>Overload</td><td>overload [timeout n]</td><td>set-overload-bit [on-startup n]</td></tr></table>
<h3>Labs ke interoperability rules</h3>
<ul><li><b>Same level aur same network type.</b> Dono ends level 2, dono point-to-point.</li>
<li><b>Compatible metrics.</b> Junos ke wide-only jaane se pehle IOS ko wide TLVs padhne chahiye.</li>
<li><b>Area addresses.</b> Level 2 adjacencies ke liye areas ka match hona zaroori nahi, par poore core mein ek area value (Lab 1 mein 49.0300) design simple rakhti hai. System IDs unique honi chahiye.</li>
<li><b>MTU.</b> Kai platforms par IS-IS hellos interface MTU tak pad hote hain, isliye MTU mismatch adjacency ko atkaye rakh sakta hai chahe link par dono sides up hon.</li>
<li><b>Hostname.</b> Dono vendors dynamic hostname carry karte hain, isliye show output system IDs ke bajay names (JR1, R1) use karta hai.</li></ul>
<h3>IS-IS core mein authentication</h3>
<p>Core adjacency authenticated honi chahiye, taaki link par rogue device IGP join na kar sake. Junos par hellos per interface aur level, aur LSPs aur SNPs per level authenticate kar sakte ho. Key mismatch adjacency ko banne se rokta hai, ya router LSPs ignore karta hai. spcor-sp-security mein IGP authentication wale security chapter se compare karo. Neeche saari keys placeholders hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - Junos</span>
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-type md5
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key "PLACEHOLDER-KEY-1"
set protocols isis level 2 authentication-type md5
set protocols isis level 2 authentication-key "PLACEHOLDER-KEY-1"

<span class="c">! Reference configuration (not run in the simulator) - IOS neighbour</span>
key chain KC-ISIS
 key 1
  key-string PLACEHOLDER-KEY-1
interface GigabitEthernet0/0
 isis authentication mode md5 level-2
 isis authentication key-chain KC-ISIS level-2
router isis
 authentication mode md5 level-2
 authentication key-chain KC-ISIS level-2</pre>
<p>Hello authentication (per interface) rogue router ko adjacency banane se rokta hai. LSP authentication (per level) forged database updates rokta hai. Dono use karo. Authentication maintenance window mein har link ke dono ends par lagao, kyunki one-sided change adjacency gira deta hai.</p>
<h3>SP core mein IS-IS ke around badhte features</h3>
<ul><li><b>BFD</b> sub-second failure detection ke liye (sirf reference, yahan cover nahi).</li>
<li><b>LDP-IGP synchronisation</b>: link ko IS-IS mein tab tak use mat karo jab tak us par LDP up na ho, black holes se bachne ke liye (spcor-mpls-ldp dekho). Junos par yeh IS-IS interface ke neeche <code>ldp-synchronization</code> hai.</li>
<li><b>Traffic engineering extensions</b>: wide metrics prerequisite hain.</li></ul>
<div class="eg"><p><b>Worked example.</b> Naya Juniper-se-IOS link sirf Junos par hello authentication ke saath up hota hai. Junos apne hellos sign karta hai; IOS ke paas key nahi, isliye woh unhe invalid maankar ignore karta hai. Junos side ko IOS se hello nahi dikhta aur adjacency kabhi nahi banti. IOS par same key chain jodne se fix hota hai. IP addressing mein koi change nahi chahiye tha.</p></div>
<div class="warn"><p><b>Common mistake.</b> Sirf ek end authenticate karna, ya dono vendors par alag algorithms ya key IDs use karna. Change plan mein dono ends par algorithm, key aur level hamesha list karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vendors ke beech translate karna aana chahiye: show isis adjacency versus show isis neighbors, level 1 disable versus is-type level-2-only, overload versus set-overload-bit, wide-metrics-only versus metric-style wide.</p></div>
<div class="scn"><h4>Woh hello jo kisi ne nahi suna</h4><p>Security change ke baad Junos se IOS adjacency gir gayi aur down rahi. Junos engineer ne hello authentication enable kiya tha; IOS team ko bataya nahi gaya tha. Usi window mein IOS par matching key chain lagane se adjacency seconds mein up ho gayi.</p><p><b>Lesson:</b> Authentication changes do-ended changes hain.</p></div>
<div class="iv"><p class="q">"Level-2 only IS-IS wide metrics ke saath ke Junos aur IOS commands batao."</p><p>Junos: set protocols isis level 1 disable aur set protocols isis level 2 wide-metrics-only, family iso aur lo0 par NET ke saath. IOS: router isis mein net, is-type level-2-only aur metric-style wide, aur interfaces par ip router isis. Links ke liye dono vendors par point-to-point use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Junos aur IOS ke command equivalents jaano.</li>
<li>Interoperability ko same level, network type aur compatible metrics chahiye.</li>
<li>Hellos aur LSPs authenticate karo; dono ends saath badlo.</li>
<li>LDP-IGP synchronisation black holes rokta hai (spcor-mpls-ldp dekho).</li>
<li>Yahan authentication config sirf reference hai.</li></ul></div>
`}};export{e as default};