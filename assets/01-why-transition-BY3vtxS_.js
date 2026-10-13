var e={id:`why-transition`,h:{en:`Why IPv6 transition mechanisms exist: what you will learn and the big picture`,hi:`IPv6 transition mechanisms kyun hain: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a service provider keeps customers online while the world moves from IPv4 to IPv6: carrier-grade NAT (CGNAT), NAT64 with DNS64, 464XLAT, DS-Lite, and the MAP-T and MAP-E family. For each one you will learn who the actors are, what is translated or tunnelled, where state is kept, and what breaks. This matches the IPv6 transition and address-sharing topics in the Cisco CCNP Service Provider core exam (SPCOR 350-501).</p>
<p><b>Prerequisites.</b> You should know IPv6 addressing and neighbor discovery (see the np-ipv6 module) and NAT basics, such as inside local and inside global addresses (see ccna-nat). You do not need any carrier experience.</p>
<p><b>Honest note about practice.</b> This module has no simulator labs. The simulator does not implement NAT64, CGNAT or the tunnel mechanisms below. Every configuration in this module is labelled <i>Reference configuration (not run in the simulator)</i>. To practise the building blocks, use ccna-nat for NAT behaviour, np-ipv6 for IPv6 addressing and routing, and spcor-l3vpn and spcor-mpls-ldp for the provider core that carries this traffic.</p>

<h3>Analogy: two postal systems that must exchange letters</h3>
<p>Imagine a country that is switching from old postcodes to new, longer postcodes. Some houses only understand the old format. Some only understand the new. The post office has three choices. It can give every house both postcodes (<b>dual-stack</b>). It can put a letter in an outer envelope with the other system's address so it can cross the gap (<b>tunnelling</b>). Or it can open the letter and rewrite the address on a translated copy (<b>translation</b>). Each choice costs something: a second postcode for everyone, an extra envelope, or a clerk who must remember who wrote to whom. Every mechanism in this module is one of these three choices, or a mix.</p>

<h3>The problem</h3>
<p>IPv4 has about 4.3 billion addresses and the free pools of the regional registries are exhausted. A provider still has to connect new subscribers, and most content is still reachable over IPv4. IPv6 has room for everyone, but IPv4 and IPv6 are <b>not compatible</b>: an IPv6-only host cannot talk directly to an IPv4-only server. Transition mechanisms close that gap.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three families of transition">
<rect x="20" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">Dual-stack</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">IPv4 and IPv6 side by side</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="12">needs IPv4 addresses</text><text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">CGNAT stretches them</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Tunnelling</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">carry IPv4 inside IPv6</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">DS-Lite, MAP-E</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">one family in the core</text>
<rect x="430" y="20" width="190" height="150" rx="10" fill="#bbf7d0"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">Translation</text><text x="525" y="75" text-anchor="middle" class="svg-muted" font-size="12">rewrite headers</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">NAT64, 464XLAT, MAP-T</text><text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">no extra encapsulation</text>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">Every mechanism is one of these three, or a mix</text>
</svg><p class="cap">The three families of IPv6 transition.</p></div>

<h3>The key terms</h3>
<dl class="terms">
<dt>Dual-stack</dt><dd>A device or network runs IPv4 and IPv6 at the same time.</dd>
<dt>CGNAT (carrier-grade NAT, also LSN)</dt><dd>Large-scale NAT inside the provider that lets many subscribers share a small pool of public IPv4 addresses.</dd>
<dt>Stateful translation</dt><dd>The translator keeps a table entry per flow, so it knows how to translate the reply.</dd>
<dt>Stateless translation</dt><dd>The translator computes the result from the packet and fixed rules. It keeps no per-flow table.</dd>
<dt>Tunnel</dt><dd>One protocol carried inside another, with an outer header added at the entry and removed at the exit.</dd>
<dt>CPE</dt><dd>Customer premises equipment, the home or branch router at the subscriber.</dd>
</dl>

<h3>Why one mechanism is not enough</h3>
<p>Providers differ. A mobile operator has an IPv6-only radio and core, but handsets still run IPv4-only apps. A fixed broadband operator has millions of old home routers. An enterprise wants IPv6 users to reach an IPv4-only application. Each situation fits a different mechanism, and the SPCOR exam asks you to match the mechanism to the situation. The table gives a first map, which later chapters explain in depth.</p>
<table class="cmp"><tr><th>Mechanism</th><th>Access network</th><th>Where state lives</th></tr>
<tr><td>Dual-stack + CGNAT</td><td>IPv4 and IPv6</td><td>CGNAT, per flow</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients to IPv4 servers</td><td>NAT64, per flow</td></tr>
<tr><td>464XLAT</td><td>IPv6-only, IPv4-only apps on the host</td><td>PLAT, per flow</td></tr>
<tr><td>DS-Lite</td><td>IPv6-only, IPv4 inside a tunnel</td><td>AFTR, per flow</td></tr>
<tr><td>MAP-T / MAP-E</td><td>IPv6-only, IPv4 over stateless rules</td><td>None for IPv4-to-IPv4 sharing</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A provider has 4,000 spare public IPv4 addresses and 400,000 subscribers. That is a ratio of 100 subscribers per address. If each subscriber needs up to 500 simultaneous ports, a shared address can serve only about 65,000 minus reserved ports divided by 500, so roughly 120 subscribers. At 100 per address the plan is tight, which is why the provider also pushes IPv6 hard: every flow that uses IPv6 never touches the NAT.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating IPv6 transition as a one-time event. It is a long coexistence period, and a provider normally runs several mechanisms at once for different customer groups.</p></div>
<div class="exam"><p><b>Exam trap.</b> Translation, tunnelling and dual-stack are different categories. NAT64 is translation, DS-Lite is tunnelling, and MAP-T is translation while MAP-E is tunnelling. Do not mix them up.</p></div>

<div class="scn"><h4>The operator that ran out of addresses</h4><p>A regional broadband provider grew faster than its IPv4 allocation. It deployed CGNAT in one quarter and received complaints from gamers about port-forwarding. It then moved most traffic to native IPv6 with dual-stack and kept CGNAT only for the IPv4 remainder. Complaints fell and NAT capacity was no longer the limit.</p><p><b>Lesson:</b> translation buys time, but moving traffic to IPv6 is the real fix.</p></div>

<div class="iv"><p class="q">"Why do we need IPv6 transition mechanisms if IPv6 is the future?"</p><p>IPv4 and IPv6 are not interoperable, and much content and many devices are still IPv4-only. A provider must connect IPv6-only subscribers to IPv4 services. Name the three families: dual-stack, tunnelling and translation. Give one example of each and say where state is kept.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 and IPv6 do not interoperate, so a bridge is needed.</li>
<li>Three families: dual-stack, tunnelling, translation.</li>
<li>CGNAT shares scarce IPv4 addresses among many subscribers.</li>
<li>Stateful mechanisms keep a table per flow; stateless ones compute the mapping.</li>
<li>The simulator has no labs for this module; use related modules to practise the parts.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki service provider customers ko online kaise rakhta hai jab duniya IPv4 se IPv6 par ja rahi hai: carrier-grade NAT (CGNAT), DNS64 ke saath NAT64, 464XLAT, DS-Lite, aur MAP-T tatha MAP-E family. Har ek ke liye aap seekhoge ki actors kaun hain, kya translate ya tunnel hota hai, state kahan rakhi jaati hai, aur kya toot sakta hai. Yeh Cisco CCNP Service Provider core exam (SPCOR 350-501) ke IPv6 transition aur address-sharing topics se match karta hai.</p>
<p><b>Prerequisites.</b> Aapko IPv6 addressing aur neighbor discovery aani chahiye (np-ipv6 module dekho) aur NAT ke basics, jaise inside local aur inside global addresses (ccna-nat dekho). Carrier experience ki zaroorat nahi.</p>
<p><b>Practice ke baare mein honest note.</b> Is module mein simulator labs nahi hain. Simulator NAT64, CGNAT ya neeche ke tunnel mechanisms implement nahi karta. Is module ki har configuration par <i>Reference configuration (not run in the simulator)</i> likha hai. Building blocks practise karne ke liye NAT behaviour ke liye ccna-nat, IPv6 addressing aur routing ke liye np-ipv6, aur is traffic ko le jaane wale provider core ke liye spcor-l3vpn aur spcor-mpls-ldp use karo.</p>

<h3>Analogy: do postal systems jinhe letters exchange karne hain</h3>
<p>Socho ek desh purane postcodes se naye, lambe postcodes par ja raha hai. Kuch ghar sirf purana format samajhte hain. Kuch sirf naya. Post office ke paas teen options hain. Har ghar ko dono postcodes de de (<b>dual-stack</b>). Letter ko doosre system ke address wale outer envelope mein daal de taaki gap cross kar sake (<b>tunnelling</b>). Ya letter kholkar translated copy par address likh de (<b>translation</b>). Har option ki ek keemat hai: sabko doosra postcode, extra envelope, ya ek clerk jise yaad rakhna padta hai ki kisne kisko likha. Is module ka har mechanism in teen choices mein se ek hai, ya mix.</p>

<h3>Problem</h3>
<p>IPv4 mein lagbhag 4.3 billion addresses hain aur regional registries ke free pools khatam ho chuke hain. Provider ko phir bhi naye subscribers jodne hain, aur zyaadatar content abhi bhi IPv4 par milta hai. IPv6 mein sabke liye jagah hai, lekin IPv4 aur IPv6 <b>compatible nahi</b> hain: IPv6-only host seedha IPv4-only server se baat nahi kar sakta. Transition mechanisms is gap ko bharte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Transition ki teen families">
<rect x="20" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">Dual-stack</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">IPv4 aur IPv6 saath-saath</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="12">IPv4 addresses chahiye</text><text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">CGNAT unhe kheenchta hai</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Tunnelling</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">IPv4 ko IPv6 mein carry karo</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">DS-Lite, MAP-E</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">core mein ek hi family</text>
<rect x="430" y="20" width="190" height="150" rx="10" fill="#bbf7d0"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">Translation</text><text x="525" y="75" text-anchor="middle" class="svg-muted" font-size="12">headers rewrite karo</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">NAT64, 464XLAT, MAP-T</text><text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">extra encapsulation nahi</text>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">Har mechanism inme se ek hai, ya mix</text>
</svg><p class="cap">IPv6 transition ki teen families.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Dual-stack</dt><dd>Device ya network IPv4 aur IPv6 dono ek saath chalata hai.</dd>
<dt>CGNAT (carrier-grade NAT, LSN bhi)</dt><dd>Provider ke andar large-scale NAT jo bahut saare subscribers ko chhote public IPv4 pool share karne deta hai.</dd>
<dt>Stateful translation</dt><dd>Translator har flow ke liye table entry rakhta hai, isliye use reply translate karna aata hai.</dd>
<dt>Stateless translation</dt><dd>Translator packet aur fixed rules se result nikalta hai. Per-flow table nahi rakhta.</dd>
<dt>Tunnel</dt><dd>Ek protocol doosre ke andar carry hota hai; entry par outer header lagta hai aur exit par hat jaata hai.</dd>
<dt>CPE</dt><dd>Customer premises equipment, subscriber ka home ya branch router.</dd>
</dl>

<h3>Ek mechanism kaafi kyun nahi</h3>
<p>Providers alag hote hain. Mobile operator ka radio aur core IPv6-only hai, lekin handsets par IPv4-only apps chalte hain. Fixed broadband operator ke paas lakhon purane home routers hain. Enterprise chahta hai ki IPv6 users IPv4-only application tak pahunchein. Har situation alag mechanism ke liye fit hai, aur SPCOR exam mechanism ko situation se match karne ko kehta hai. Table pehla map deta hai, jise baad ke chapters detail mein samjhate hain.</p>
<table class="cmp"><tr><th>Mechanism</th><th>Access network</th><th>State kahan rehti hai</th></tr>
<tr><td>Dual-stack + CGNAT</td><td>IPv4 aur IPv6</td><td>CGNAT, per flow</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients se IPv4 servers</td><td>NAT64, per flow</td></tr>
<tr><td>464XLAT</td><td>IPv6-only, host par IPv4-only apps</td><td>PLAT, per flow</td></tr>
<tr><td>DS-Lite</td><td>IPv6-only, IPv4 tunnel ke andar</td><td>AFTR, per flow</td></tr>
<tr><td>MAP-T / MAP-E</td><td>IPv6-only, IPv4 stateless rules par</td><td>IPv4 sharing ke liye koi nahi</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Provider ke paas 4,000 spare public IPv4 addresses aur 400,000 subscribers hain. Yaani ratio 100 subscribers per address. Agar har subscriber ko 500 simultaneous ports tak chahiye, to ek shared address lagbhag 65,000 minus reserved ports ko 500 se divide karke, takreeban 120 subscribers serve kar sakta hai. 100 per address par plan tight hai, isliye provider IPv6 bhi zor se push karta hai: jo flow IPv6 use karta hai woh kabhi NAT ko touch nahi karta.</p></div>

<div class="warn"><p><b>Common mistake.</b> IPv6 transition ko one-time event samajhna. Yeh lambi coexistence period hai, aur provider aam taur par alag customer groups ke liye kai mechanisms ek saath chalata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Translation, tunnelling aur dual-stack alag categories hain. NAT64 translation hai, DS-Lite tunnelling hai, aur MAP-T translation hai jabki MAP-E tunnelling. Inhe mix mat karo.</p></div>

<div class="scn"><h4>Woh operator jiske addresses khatam ho gaye</h4><p>Ek regional broadband provider apni IPv4 allocation se tez badha. Usne ek quarter mein CGNAT deploy kiya aur gamers ne port-forwarding ki complaints ki. Phir usne zyaadatar traffic dual-stack ke saath native IPv6 par shift kiya aur CGNAT sirf bache hue IPv4 ke liye rakha. Complaints ghati aur NAT capacity limit nahi rahi.</p><p><b>Lesson:</b> translation waqt kharidta hai, lekin asli fix traffic ko IPv6 par le jaana hai.</p></div>

<div class="iv"><p class="q">"Agar IPv6 future hai to transition mechanisms ki zaroorat kyun?"</p><p>IPv4 aur IPv6 interoperable nahi hain, aur bahut sa content aur devices abhi IPv4-only hain. Provider ko IPv6-only subscribers ko IPv4 services se jodna padta hai. Teen families batao: dual-stack, tunnelling aur translation. Har ek ka ek example do aur batao state kahan rakhi jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 aur IPv6 interoperate nahi karte, isliye bridge chahiye.</li>
<li>Teen families: dual-stack, tunnelling, translation.</li>
<li>CGNAT kam IPv4 addresses ko bahut subscribers mein share karta hai.</li>
<li>Stateful mechanisms per flow table rakhte hain; stateless mapping compute karte hain.</li>
<li>Is module ke liye simulator mein labs nahi hain; parts practise karne ke liye related modules use karo.</li>
</ul></div>
`}};export{e as default};