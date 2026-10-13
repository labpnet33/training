var e={id:`lsdb-lsa-types`,h:{en:`The link-state database and the LSA types`,hi:`Link-state database aur LSA types`},body:{en:`
<p>Think of the LSDB as the shared city map from chapter 1. The map is made of small notices, the <b>LSAs</b>. Different notices describe different things: a router describes its own links, a LAN describes who sits on it, a border router describes a distant district, and a gateway describes a road leading outside the company. Each kind has a <b>type number</b>. If you know what each type says, who creates it and how far it travels, you can read any OSPF database.</p>

<h3>How an LSA is identified and kept fresh</h3>
<p>Every LSA is identified by three things: <b>type</b>, <b>link-state ID</b> and <b>advertising router</b>. It also carries a <b>sequence number</b>, an <b>age</b> and a <b>checksum</b>. When two copies of the same LSA meet, the one with the higher sequence number wins (the starting value is 0x80000001). The originator refreshes its LSAs every 50 minutes on Junos by raising the sequence number, and an LSA that reaches the maximum age of one hour is removed from every database. A change in the network causes the originator to send a new copy at once, so you see the sequence number grow.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="LSA flooding scope">
<rect x="20" y="30" width="190" height="190" rx="12" fill="#bbf7d0"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 10</text>
<text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 router LSA</text><text x="115" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 2 network LSA</text>
<rect x="225" y="30" width="190" height="190" rx="12" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 0</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 and 2 (own area)</text><text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="12">Type 3 and 4 from ABRs</text>
<rect x="430" y="30" width="190" height="190" rx="12" fill="#ddd6fe"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 20</text>
<text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 and 2 (own area)</text><text x="525" y="115" text-anchor="middle" class="svg-accent" font-size="12">Type 3 and 4 from ABR</text>
<rect x="60" y="170" width="520" height="38" rx="8" fill="#fde68a"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">Type 5 external LSAs flood through the whole AS (not stub or NSSA)</text>
</svg><p class="cap">Types 1 and 2 stay in their area; ABRs create types 3 and 4; type 5 crosses everything.</p></div>

<table class="cmp"><tr><th>Type</th><th>Junos name</th><th>Created by</th><th>Scope</th><th>Describes</th></tr>
<tr><td>1</td><td>Router</td><td>every router</td><td>its area</td><td>its links, their types and costs</td></tr>
<tr><td>2</td><td>Network</td><td>the DR</td><td>its area</td><td>the routers attached to a broadcast LAN</td></tr>
<tr><td>3</td><td>Summary</td><td>ABR</td><td>one area</td><td>a prefix from another area</td></tr>
<tr><td>4</td><td>ASBRSum</td><td>ABR</td><td>one area</td><td>how to reach an ASBR in another area</td></tr>
<tr><td>5</td><td>Extern</td><td>ASBR</td><td>whole AS</td><td>a prefix from outside OSPF</td></tr>
<tr><td>7</td><td>NSSA</td><td>ASBR in an NSSA</td><td>that NSSA</td><td>an external prefix; the ABR converts it to type 5</td></tr></table>

<h3>Reading real output</h3>
<p>Here is the database of ABR R2 in the two-region lab. The star marks LSAs that R2 itself originated. Look at area 0.0.0.0: R2 and R3 each have a Router LSA, there is one Network LSA for the link they share (it is a broadcast-type link, so a DR exists), and the Summary LSAs are prefixes from outside area 0.</p>
<pre class="out">lab@R2-AGRA&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.0.2       10.255.0.2       0x80000001   125  0x22 0x7a47  48
Router   10.255.0.3       10.255.0.3       0x80000001   125  0x22 0x6793  48
Network  10.0.23.2        10.255.0.3       0x80000001   125  0x22 0x36f6  32
Summary *10.10.12.0       10.255.0.2       0x80000001   120  0x22 0x734d  28
Summary  10.20.34.0       10.255.0.3       0x80000001   120  0x22 0x9001  28
Summary *172.20.1.0       10.255.0.2       0x80000001    75  0x22 0x89de  28
Summary  172.21.1.0       10.255.0.3       0x80000001    76  0x22 0xcb9d  28</pre>
<p>The Network LSA ID is 10.0.23.2: for a type 2 LSA the ID is the <b>interface address of the DR</b>, and the advertising router is the DR's router ID (R3, 10.255.0.3). For a Summary LSA the ID is the prefix and the advertising router is the ABR that created it. Add <code>detail</code> to see the body:</p>
<pre class="out">lab@R1-AGRA&gt; show ospf database router detail
Router  *10.255.0.1       10.255.0.1       0x80000002    15  0x22 0xc509  72
  bits 0x0, link count 4
  id 10.10.12.2, data 10.10.12.1, Type <span class="hl">Transit (2)</span>
    Topology count: 0, Default metric: 1
  id 172.20.1.0, data 255.255.255.0, Type <span class="hl">Stub (3)</span>
    Topology count: 0, Default metric: 1
  id 10.255.0.1, data 255.255.255.255, Type Stub (3)
    Topology count: 0, Default metric: 0</pre>
<p>A router LSA lists links of four kinds: point-to-point, <b>transit</b> (a LAN with a DR; the ID is the DR's address), <b>stub</b> (a prefix with no neighbours, such as a passive LAN or a loopback) and virtual. The <code>bits</code> field is where the B bit (ABR) and E bit (ASBR) live: R2 above shows <code>bits 0x1</code> for the ABR in the lab output.</p>

<h3>Useful filters</h3>
<pre class="code">show ospf database router
show ospf database netsummary lsa-id 172.20.1.0 detail
show ospf database advertising-router 10.255.0.1 detail
show ospf database summary</pre>
<p>The last command only counts the LSAs per area and type, which is a quick way to compare two routers when you suspect an inconsistent database.</p>

<div class="eg"><p><b>Worked example.</b> R4 in area 0.0.0.20 shows a Summary LSA for 172.20.1.0 with advertising router 10.255.0.3 and metric 3. R2 is the ABR that first created a type 3 LSA for that prefix into area 0, but inside area 20 the LSA is re-originated by the area 20 ABR, R3. So the advertising router changes at each ABR. That is why summary LSAs describe <i>distance</i>, not the topology behind the ABR: a router only knows the ABR's cost plus the ABR's advertised metric.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking for the original router in a type 3 LSA. The advertising router of a summary LSA is always the ABR of the area you are looking at, not the router that owns the prefix.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 1 and 2 LSAs never leave their area. Type 4 exists only because an ASBR in another area cannot be reached by type 1 LSAs. Type 5 LSAs are not flooded into stub and NSSA areas. Higher sequence number wins; MaxAge is one hour.</p></div>

<div class="scn"><h4>Two routers, two different databases</h4><p>After a change window, R2 and R3 gave different answers about a prefix. The engineer ran <code>show ospf database summary</code> on both and found R3 had one Summary LSA fewer in area 20. A look at the sequence numbers showed an old copy on R3. A <code>clear ospf database</code> is disruptive, so instead the engineer checked the ABR and found a stray area-range had been left on it from last week.</p><p><b>Lesson:</b> compare LSA counts first, then the advertising router and sequence number, then look for the policy or range that created the difference.</p></div>

<div class="iv"><p class="q">"Name the OSPF LSA types and say what each one does."</p><p>Type 1 (router) lists a router's links; type 2 (network) is sent by the DR for a LAN; type 3 (summary) is created by an ABR for prefixes from another area; type 4 (ASBRSum) tells where an ASBR is; type 5 (external) is created by the ASBR for outside routes; type 7 is the NSSA version of type 5. Add that 1 and 2 are area scoped, 5 is AS wide, and mention the sequence number rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An LSA is identified by type, link-state ID and advertising router; the higher sequence number wins.</li>
<li>Types 1 and 2 stay inside one area; ABRs create types 3 and 4; ASBRs create type 5 (or 7 in an NSSA).</li>
<li>In a type 2 LSA the ID is the DR interface address; in a type 3 LSA the ID is the prefix.</li>
<li>A star in <code>show ospf database</code> marks an LSA this router originated.</li>
<li>Use <code>detail</code> and <code>show ospf database summary</code> to compare databases.</li>
</ul></div>
`,hi:`
<p>LSDB ko chapter 1 ke shared city map ki tarah socho. Map chhote notices se bana hai, yaani <b>LSAs</b>. Alag-alag notices alag cheezein batate hain: router apne links batata hai, LAN batati hai ki us par kaun baitha hai, border router door ke district ke baare mein batata hai, aur gateway company ke bahar jaati road ke baare mein batata hai. Har kism ka ek <b>type number</b> hota hai. Agar aapko pata hai ki har type kya kehta hai, kaun banata hai aur kitni door tak jaata hai, to aap kisi bhi OSPF database ko padh sakte ho.</p>

<h3>LSA ki pehchaan aur use fresh kaise rakha jaata hai</h3>
<p>Har LSA ki pehchaan teen cheezon se hoti hai: <b>type</b>, <b>link-state ID</b> aur <b>advertising router</b>. Usme <b>sequence number</b>, <b>age</b> aur <b>checksum</b> bhi hota hai. Jab ek hi LSA ki do copies milti hain, to bada sequence number jeetta hai (shuruaati value 0x80000001). Originator Junos par apne LSAs ko har 50 minute mein sequence number badhake refresh karta hai, aur jo LSA maximum age (ek ghanta) tak pahunch jaaye wo har database se hata diya jaata hai. Network mein change aaye to originator turant nayi copy bhejta hai, isliye aapko sequence number badhta dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="LSA flooding scope">
<rect x="20" y="30" width="190" height="190" rx="12" fill="#bbf7d0"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 10</text>
<text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 router LSA</text><text x="115" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 2 network LSA</text>
<rect x="225" y="30" width="190" height="190" rx="12" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 0</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 aur 2 (apna area)</text><text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="12">ABRs ke Type 3 aur 4</text>
<rect x="430" y="30" width="190" height="190" rx="12" fill="#ddd6fe"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="14">Area 20</text>
<text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 aur 2 (apna area)</text><text x="525" y="115" text-anchor="middle" class="svg-accent" font-size="12">ABR ke Type 3 aur 4</text>
<rect x="60" y="170" width="520" height="38" rx="8" fill="#fde68a"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">Type 5 external LSAs poore AS mein flood hote hain (stub ya NSSA mein nahi)</text>
</svg><p class="cap">Type 1 aur 2 apne area mein rehte hain; ABRs type 3 aur 4 banate hain; type 5 sab jagah jaata hai.</p></div>

<table class="cmp"><tr><th>Type</th><th>Junos naam</th><th>Kaun banata hai</th><th>Scope</th><th>Kya batata hai</th></tr>
<tr><td>1</td><td>Router</td><td>har router</td><td>apna area</td><td>apne links, unke types aur costs</td></tr>
<tr><td>2</td><td>Network</td><td>DR</td><td>apna area</td><td>broadcast LAN se jude routers</td></tr>
<tr><td>3</td><td>Summary</td><td>ABR</td><td>ek area</td><td>doosre area ka prefix</td></tr>
<tr><td>4</td><td>ASBRSum</td><td>ABR</td><td>ek area</td><td>doosre area ke ASBR tak kaise pahunchein</td></tr>
<tr><td>5</td><td>Extern</td><td>ASBR</td><td>poora AS</td><td>OSPF ke bahar ka prefix</td></tr>
<tr><td>7</td><td>NSSA</td><td>NSSA ka ASBR</td><td>wahi NSSA</td><td>external prefix; ABR ise type 5 mein badalta hai</td></tr></table>

<h3>Real output padhna</h3>
<p>Yeh do-region lab mein ABR R2 ka database hai. Star un LSAs par hai jo R2 ne khud banaye. Area 0.0.0.0 dekho: R2 aur R3 ka apna Router LSA hai, unke shared link ke liye ek Network LSA hai (link broadcast-type hai, isliye DR maujood hai), aur Summary LSAs wo prefixes hain jo area 0 ke bahar ke hain.</p>
<pre class="out">lab@R2-AGRA&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.0.2       10.255.0.2       0x80000001   125  0x22 0x7a47  48
Router   10.255.0.3       10.255.0.3       0x80000001   125  0x22 0x6793  48
Network  10.0.23.2        10.255.0.3       0x80000001   125  0x22 0x36f6  32
Summary *10.10.12.0       10.255.0.2       0x80000001   120  0x22 0x734d  28
Summary  10.20.34.0       10.255.0.3       0x80000001   120  0x22 0x9001  28
Summary *172.20.1.0       10.255.0.2       0x80000001    75  0x22 0x89de  28
Summary  172.21.1.0       10.255.0.3       0x80000001    76  0x22 0xcb9d  28</pre>
<p>Network LSA ka ID 10.0.23.2 hai: type 2 LSA mein ID <b>DR ka interface address</b> hota hai, aur advertising router DR ka router ID (R3, 10.255.0.3) hota hai. Summary LSA mein ID prefix hota hai aur advertising router wo ABR jisne use banaya. Body dekhne ke liye <code>detail</code> jodo:</p>
<pre class="out">lab@R1-AGRA&gt; show ospf database router detail
Router  *10.255.0.1       10.255.0.1       0x80000002    15  0x22 0xc509  72
  bits 0x0, link count 4
  id 10.10.12.2, data 10.10.12.1, Type <span class="hl">Transit (2)</span>
    Topology count: 0, Default metric: 1
  id 172.20.1.0, data 255.255.255.0, Type <span class="hl">Stub (3)</span>
    Topology count: 0, Default metric: 1
  id 10.255.0.1, data 255.255.255.255, Type Stub (3)
    Topology count: 0, Default metric: 0</pre>
<p>Router LSA chaar kism ke links list karta hai: point-to-point, <b>transit</b> (DR wali LAN; ID DR ka address), <b>stub</b> (bina neighbours ka prefix, jaise passive LAN ya loopback) aur virtual. <code>bits</code> field mein B bit (ABR) aur E bit (ASBR) rehte hain: lab output mein ABR R2 ka <code>bits 0x1</code> dikhta hai.</p>

<h3>Kaam ke filters</h3>
<pre class="code">show ospf database router
show ospf database netsummary lsa-id 172.20.1.0 detail
show ospf database advertising-router 10.255.0.1 detail
show ospf database summary</pre>
<p>Aakhri command sirf har area aur type ke LSAs ginta hai; jab do routers ke database mein farq ka shak ho to compare karne ka yeh tez tareeka hai.</p>

<div class="eg"><p><b>Worked example.</b> Area 0.0.0.20 ke R4 par 172.20.1.0 ka Summary LSA dikhta hai, advertising router 10.255.0.3, metric 3. R2 wo ABR hai jisne is prefix ka type 3 LSA pehle area 0 mein banaya, par area 20 ke andar LSA ko area 20 ka ABR, R3, dobara originate karta hai. Matlab har ABR par advertising router badalta hai. Isiliye summary LSAs <i>doori</i> batate hain, ABR ke peeche ki topology nahi: router sirf ABR tak ka cost aur ABR ka advertise kiya metric jaanta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Type 3 LSA mein original router dhoondhna. Summary LSA ka advertising router hamesha us area ka ABR hota hai jise aap dekh rahe ho, prefix ka malik router nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 1 aur 2 LSAs apne area se bahar nahi jaate. Type 4 isliye hai kyunki doosre area ke ASBR tak type 1 LSAs se nahi pahunch sakte. Type 5 LSAs stub aur NSSA areas mein flood nahi hote. Bada sequence number jeetta hai; MaxAge ek ghanta hai.</p></div>

<div class="scn"><h4>Do routers, do alag databases</h4><p>Change window ke baad R2 aur R3 ek prefix par alag jawab de rahe the. Engineer ne dono par <code>show ospf database summary</code> chalaya aur dekha ki R3 ke area 20 mein ek Summary LSA kam hai. Sequence numbers dekhne par R3 par purani copy mili. <code>clear ospf database</code> disruptive hai, isliye engineer ne ABR check kiya aur dekha ki pichhle hafte ka ek bhula hua area-range wahan chhoot gaya tha.</p><p><b>Lesson:</b> pehle LSA counts compare karo, phir advertising router aur sequence number, phir wo policy ya range dhoondho jisne farq banaya.</p></div>

<div class="iv"><p class="q">"OSPF ke LSA types batao aur har ek kya karta hai."</p><p>Type 1 (router) router ke links list karta hai; type 2 (network) LAN ke liye DR bhejta hai; type 3 (summary) doosre area ke prefixes ke liye ABR banata hai; type 4 (ASBRSum) batata hai ki ASBR kahan hai; type 5 (external) bahar ke routes ke liye ASBR banata hai; type 7 NSSA ka type 5 jaisa version hai. Yeh jodo ki 1 aur 2 area scoped hain, 5 AS wide hai, aur sequence number rule ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LSA ki pehchaan type, link-state ID aur advertising router se hoti hai; bada sequence number jeetta hai.</li>
<li>Type 1 aur 2 ek area ke andar rehte hain; ABRs type 3 aur 4 banate hain; ASBRs type 5 (NSSA mein 7) banate hain.</li>
<li>Type 2 LSA mein ID DR ka interface address hai; type 3 LSA mein ID prefix hai.</li>
<li><code>show ospf database</code> mein star ka matlab LSA is router ne originate kiya.</li>
<li>Databases compare karne ke liye <code>detail</code> aur <code>show ospf database summary</code> use karo.</li>
</ul></div>
`}};export{e as default};