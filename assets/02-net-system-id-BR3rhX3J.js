var e={id:`net-system-id`,h:{en:`The NET: how IS-IS names a router and its area`,hi:`NET: IS-IS router aur uske area ko kaise naam deta hai`},body:{en:`
<p>OSPF names a router with an IPv4-looking router ID and puts the area on each interface. IS-IS does it differently: <b>one address per router</b>, called the <b>NET</b> (Network Entity Title), which holds both the area and the router's unique name. Think of a postal address: the <b>pin code</b> is the area, the <b>house number</b> is the system ID, and the final "00" is a fixed suffix saying "deliver to the router itself".</p>

<h3>Anatomy of a NET</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NET anatomy">
<rect x="20" y="40" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="14">49.0001</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">area (AFI 49 + area ID)</text>
<rect x="210" y="40" width="270" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="62" text-anchor="middle" class="svg-ink" font-size="14">0000.0000.0002</text><text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="11">system ID (6 bytes, unique)</text>
<rect x="490" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="62" text-anchor="middle" class="svg-ink" font-size="14">00</text><text x="555" y="80" text-anchor="middle" class="svg-muted" font-size="11">NSEL (always 00)</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">49.0001.0000.0000.0002.00</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Read it from the right: 1 byte NSEL, 6 bytes system ID, the rest is the area</text>
</svg><p class="cap">A NET read from the right.</p></div>
<dl class="terms">
<dt>AFI 49</dt><dd>The first byte "49" is the Authority and Format Identifier for private addressing, the equivalent of RFC 1918 space. Providers use it almost always.</dd>
<dt>Area ID</dt><dd>Everything in front of the system ID. "49.0001" and "49.0001.0001" are different areas. The area can be 1 to 13 bytes.</dd>
<dt>System ID</dt><dd>Exactly 6 bytes on Cisco and Juniper, unique in the domain. It identifies the router in LSPs and in <code>show</code> commands.</dd>
<dt>NSEL</dt><dd>Network service access point selector. It is always <b>00</b> on a router.</dd>
</dl>

<h3>Choosing a system ID the SP way</h3>
<p>Providers do not invent random IDs. They encode the loopback so the ID can be read at a glance. Take the loopback 10.0.255.4 and pad every octet to three digits: 010.000.255.004, then regroup the 12 digits into three blocks of four: <b>0100.0025.5004</b>. The NET becomes 49.0001.0100.0025.5004.00. A second convention, used in the labs, simply numbers routers: 0000.0000.0001 for R1, 0000.0000.0002 for R2. Both are fine. What matters is that <b>every router in the domain has a unique system ID</b>, even in different areas, because level-2 LSPs travel between areas.</p>

<h3>Configuring it</h3>
<pre class="code">router isis
 net 49.0001.0000.0000.0002.00
 is-type level-1-2         <span class="c">! the IOS default; shown for clarity</span>
 log-adjacency-changes
interface Loopback0
 ip router isis</pre>
<p>A router can have more than one NET (for example when migrating areas), but all NETs must share the same system ID. The <code>net</code> command is configured once under <code>router isis</code>, not per interface.</p>

<h3>Names instead of numbers</h3>
<p>Reading 0000.0000.0003 in outputs is hard. IS-IS therefore advertises the router's hostname inside its LSP (TLV 137, "dynamic hostname"), and IOS shows the name instead of the system ID wherever it can. You saw it already in <code>show isis neighbors</code>. The mapping table is:</p>
<pre class="out">R2# show isis hostname
Level  System ID      Dynamic Hostname  (null)
     * 0000.0000.0002 R2
 2     0000.0000.0003 R3
 1     0000.0000.0001 R1</pre>
<p>The asterisk marks the local router. The first column shows the level at which the name was learned. The same neighbours seen through the CLNS commands, with the data-link address (SNPA), are:</p>
<pre class="out">R2# show clns neighbors
Tag null:
System Id      Interface     SNPA                State  Holdtime  Type Protocol
R1             Gi0/0         5254.0c04.4b01      Up     27        L1   IS-IS
R3             Gi0/1         5254.0e04.4e02      Up     27        L2   IS-IS</pre>
<p><code>show clns neighbors</code> is useful because it lists the MAC address (SNPA) of each neighbour: proof that the two routers really see each other on layer 2.</p>

<div class="eg"><p><b>Worked example.</b> Router PUNE-PE1 has loopback 10.0.255.1 and sits in area 49.0001. Pad the octets: 010.000.255.001, regroup: 0100.0025.5001. NET: <code>49.0001.0100.0025.5001.00</code>. The neighbour in Nashik, loopback 10.0.255.2, in area 49.0002: <code>49.0002.0100.0025.5002.00</code>. The system IDs differ in the last block, as required, even though the areas also differ.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Duplicate system IDs: two routers claim the same name, LSPs overwrite each other and routes flap. Check the logs for a duplicate system ID warning. (2) Writing the NET with the wrong length, so that the "area" swallows part of the system ID. Always count six bytes before the final 00. (3) Changing the area on a level-1 router and losing the adjacency, because level-1 neighbours must share the area.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What is the area in NET 49.0010.0000.0000.0007.00?" The answer is <b>49.0010</b>: remove the last byte (NSEL) and the six bytes before it (system ID). Also, NSEL 00 means the NET identifies a router; any other NSEL would identify a transport entity.</p></div>

<div class="scn"><h4>Two routers, one name</h4><p>During a rollout two engineers cloned the same configuration template for routers in different cities and forgot to change the system ID. The two routers shared 0000.0000.0009. The database showed one LSP whose content kept changing, SPF ran continuously and routes to both cities flapped. Giving one router a new NET and clearing the IS-IS process fixed it.</p><p><b>Lesson:</b> system IDs must be unique across the whole domain, not only within an area.</p></div>

<div class="iv"><p class="q">"Decode this NET: 49.0002.0100.0025.5001.00."</p><p>The final 00 is the NSEL, the six bytes before it (0100.0025.5001) are the system ID and 49.0002 is the area. Add that the system ID here encodes loopback 10.0.255.1, which is a common provider habit, and that the area must match for level-1 adjacencies but the system ID must be unique everywhere.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One NET per router names both its area and its system ID.</li>
<li>Read a NET from the right: NSEL 00, six-byte system ID, then the area.</li>
<li>System IDs must be unique in the whole domain; many providers encode the loopback.</li>
<li>AFI 49 is the private address format used almost everywhere.</li>
<li>show isis hostname and show clns neighbors map names, system IDs and MACs.</li>
</ul></div>
`,hi:`
<p>OSPF router ko IPv4 jaisa router ID deta hai aur area har interface par rakhta hai. IS-IS alag karta hai: <b>har router ka ek address</b>, jise <b>NET</b> (Network Entity Title) kehte hain, jisme area aur router ka unique naam dono hote hain. Postal address ki tarah socho: <b>pin code</b> area hai, <b>ghar ka number</b> system ID hai, aur aakhri "00" ek fixed suffix hai jo kehta hai "router ko hi deliver karo".</p>

<h3>NET ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NET anatomy">
<rect x="20" y="40" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="14">49.0001</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">area (AFI 49 + area ID)</text>
<rect x="210" y="40" width="270" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="62" text-anchor="middle" class="svg-ink" font-size="14">0000.0000.0002</text><text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="11">system ID (6 bytes, unique)</text>
<rect x="490" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="62" text-anchor="middle" class="svg-ink" font-size="14">00</text><text x="555" y="80" text-anchor="middle" class="svg-muted" font-size="11">NSEL (hamesha 00)</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">49.0001.0000.0000.0002.00</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Right se padho: 1 byte NSEL, 6 bytes system ID, baaki area</text>
</svg><p class="cap">NET ko right se padhna.</p></div>
<dl class="terms">
<dt>AFI 49</dt><dd>Pehla byte "49" private addressing ka Authority and Format Identifier hai, RFC 1918 space ke barabar. Providers lagbhag hamesha yahi use karte hain.</dd>
<dt>Area ID</dt><dd>System ID ke aage ka sab kuch. "49.0001" aur "49.0001.0001" alag areas hain. Area 1 se 13 bytes ka ho sakta hai.</dd>
<dt>System ID</dt><dd>Cisco aur Juniper par theek 6 bytes, domain mein unique. Yeh LSPs aur <code>show</code> commands mein router ko pehchanta hai.</dd>
<dt>NSEL</dt><dd>Network service access point selector. Router par yeh hamesha <b>00</b> hota hai.</dd>
</dl>

<h3>SP tareeke se system ID chunna</h3>
<p>Providers random IDs nahi banate. Woh loopback ko encode karte hain taaki ID ek nazar mein padhi ja sake. Loopback 10.0.255.4 lo aur har octet ko teen digits tak pad karo: 010.000.255.004, phir 12 digits ko chaar-chaar ke teen blocks mein regroup karo: <b>0100.0025.5004</b>. NET ban jaata hai 49.0001.0100.0025.5004.00. Doosri convention, jo labs mein hai, routers ko bas number deti hai: R1 ke liye 0000.0000.0001, R2 ke liye 0000.0000.0002. Dono theek hain. Zaroori yeh hai ki <b>domain ke har router ki system ID unique ho</b>, alag areas mein bhi, kyunki level-2 LSPs areas ke beech travel karte hain.</p>

<h3>Configure karna</h3>
<pre class="code">router isis
 net 49.0001.0000.0000.0002.00
 is-type level-1-2         <span class="c">! IOS default; samajhne ke liye dikhaya</span>
 log-adjacency-changes
interface Loopback0
 ip router isis</pre>
<p>Router ke ek se zyada NET ho sakte hain (jaise areas migrate karte waqt), par saare NETs ki system ID same honi chahiye. <code>net</code> command <code>router isis</code> ke neeche ek baar likhte hain, har interface par nahi.</p>

<h3>Numbers ki jagah names</h3>
<p>Outputs mein 0000.0000.0003 padhna mushkil hai. Isliye IS-IS router ka hostname uske LSP ke andar advertise karta hai (TLV 137, "dynamic hostname"), aur IOS jahan ho sake system ID ki jagah naam dikhata hai. Aap <code>show isis neighbors</code> mein yeh dekh chuke ho. Mapping table:</p>
<pre class="out">R2# show isis hostname
Level  System ID      Dynamic Hostname  (null)
     * 0000.0000.0002 R2
 2     0000.0000.0003 R3
 1     0000.0000.0001 R1</pre>
<p>Asterisk local router ko mark karta hai. Pehla column dikhata hai ki naam kis level par seekha gaya. Wahi neighbours CLNS commands se, data-link address (SNPA) ke saath:</p>
<pre class="out">R2# show clns neighbors
Tag null:
System Id      Interface     SNPA                State  Holdtime  Type Protocol
R1             Gi0/0         5254.0c04.4b01      Up     27        L1   IS-IS
R3             Gi0/1         5254.0e04.4e02      Up     27        L2   IS-IS</pre>
<p><code>show clns neighbors</code> isliye kaam ka hai kyunki woh har neighbour ka MAC address (SNPA) batata hai: saboot ki dono routers layer 2 par sach mein ek doosre ko dekhte hain.</p>

<div class="eg"><p><b>Worked example.</b> Router PUNE-PE1 ka loopback 10.0.255.1 hai aur woh area 49.0001 mein hai. Octets pad karo: 010.000.255.001, regroup: 0100.0025.5001. NET: <code>49.0001.0100.0025.5001.00</code>. Nashik ka neighbour, loopback 10.0.255.2, area 49.0002 mein: <code>49.0002.0100.0025.5002.00</code>. System IDs aakhri block mein alag hain, jaisa chahiye, jabki areas bhi alag hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Duplicate system IDs: do routers same naam claim karte hain, LSPs ek doosre ko overwrite karte hain aur routes flap hote hain. Logs mein duplicate system ID warning dekho. (2) NET ko galat length mein likhna, jisse "area" system ID ka hissa kha leta hai. Aakhri 00 se pehle hamesha chhe bytes gino. (3) Level-1 router ka area badalkar adjacency kho dena, kyunki level-1 neighbours ko same area chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "NET 49.0010.0000.0000.0007.00 mein area kya hai?" Jawab <b>49.0010</b>: aakhri byte (NSEL) aur usse pehle ke chhe bytes (system ID) hata do. Aur NSEL 00 ka matlab NET router ko identify karta hai; koi aur NSEL transport entity ko identify karta.</p></div>

<div class="scn"><h4>Do routers, ek naam</h4><p>Rollout ke dauraan do engineers ne alag cities ke routers ke liye ek hi configuration template clone kiya aur system ID badalna bhool gaye. Dono routers 0000.0000.0009 share karte the. Database mein ek hi LSP dikha jiska content badalta rehta tha, SPF lagatar chalta raha aur dono cities ke routes flap hue. Ek router ko naya NET dene aur IS-IS process clear karne se theek ho gaya.</p><p><b>Lesson:</b> system IDs poore domain mein unique honi chahiye, sirf area ke andar nahi.</p></div>

<div class="iv"><p class="q">"Is NET ko decode karo: 49.0002.0100.0025.5001.00."</p><p>Aakhri 00 NSEL hai, usse pehle ke chhe bytes (0100.0025.5001) system ID hain aur 49.0002 area hai. Jodo ki yahan system ID loopback 10.0.255.1 ko encode karti hai, jo provider ki aam aadat hai, aur level-1 adjacencies ke liye area match karna chahiye par system ID har jagah unique honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek NET per router uska area aur system ID dono naam deta hai.</li>
<li>NET ko right se padho: NSEL 00, chhe-byte system ID, phir area.</li>
<li>System IDs poore domain mein unique honi chahiye; kai providers loopback encode karte hain.</li>
<li>AFI 49 private address format hai jo lagbhag hamesha use hota hai.</li>
<li>show isis hostname aur show clns neighbors naam, system ID aur MACs map karte hain.</li>
</ul></div>
`}};export{e as default};