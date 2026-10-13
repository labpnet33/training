var e={id:`lisp-config`,h:{en:`Configure and verify LISP on IOS XE`,hi:`IOS XE par LISP configure aur verify karna`},body:{en:`
<p>Configuring LISP is like opening a new branch of a courier company. First the head office creates an account for the branch and gives it a password (site and key on the map-server). Then the branch tells head office which customers it serves (database-mapping) and where to ask about everybody else (map-resolver). Nothing works until both sides agree on the password.</p>

<h3>Step 0: the underlay must work first</h3>
<p>Every RLOC must reach the MS/MR and every other RLOC. In the lab, OSPF on CORE advertises 100.64.0.0/16 links. Before touching LISP, run <code>ping 100.64.3.2 source GigabitEthernet0/0</code> on each xTR. If this fails, stop and fix OSPF: LISP cannot fix a broken underlay.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="What must match between xTR and MS">
<rect x="20" y="20" width="260" height="150" rx="10" fill="#bae6fd"/><text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">XTR2</text>
<text x="150" y="72" text-anchor="middle" class="svg-muted" font-size="12">etr map-server 100.64.3.2</text>
<text x="150" y="94" text-anchor="middle" class="svg-accent" font-size="12">key NK-LISP</text>
<text x="150" y="116" text-anchor="middle" class="svg-accent" font-size="12">database-mapping 10.2.2.0/24</text>
<text x="150" y="138" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.2.2 (own address)</text>
<rect x="360" y="20" width="260" height="150" rx="10" fill="#ddd6fe"/><text x="490" y="44" text-anchor="middle" class="svg-ink" font-size="14">MSMR</text>
<text x="490" y="72" text-anchor="middle" class="svg-muted" font-size="12">site SITE-B</text>
<text x="490" y="94" text-anchor="middle" class="svg-accent" font-size="12">authentication-key NK-LISP</text>
<text x="490" y="116" text-anchor="middle" class="svg-accent" font-size="12">eid-prefix 10.2.2.0/24</text>
<text x="490" y="138" text-anchor="middle" class="svg-muted" font-size="12">map-server, map-resolver</text>
<line x1="250" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="112" x2="390" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">key and EID prefix must match, or the Map-Register is rejected</text>
</svg><p class="cap">The two things that must agree between an ETR and its map-server.</p></div>

<h3>Step 1: the map-server and map-resolver (MSMR)</h3>
<pre class="code">MSMR(config)# router lisp
<span class="c">! one site object per customer site: allowed EID prefixes + key</span>
MSMR(config-router-lisp)# site SITE-A
MSMR(config-router-lisp-site)#  authentication-key NK-LISP
MSMR(config-router-lisp-site)#  eid-prefix 10.1.1.0/24
MSMR(config-router-lisp-site)#  exit-site
MSMR(config-router-lisp)# site SITE-B
MSMR(config-router-lisp-site)#  authentication-key NK-LISP
MSMR(config-router-lisp-site)#  eid-prefix 10.2.2.0/24
MSMR(config-router-lisp-site)#  exit-site
<span class="c">! turn on the two roles for IPv4 EIDs</span>
MSMR(config-router-lisp)# service ipv4
MSMR(config-lisp-srv-ipv4)#  map-server
MSMR(config-lisp-srv-ipv4)#  map-resolver
MSMR(config-lisp-srv-ipv4)#  exit-service-ipv4</pre>
<p>The <code>site</code> is the security boundary. An ETR can register only prefixes that fall inside an <code>eid-prefix</code> of a site, and only with that site's key. Adding <code>accept-more-specifics</code> under <code>eid-prefix</code> lets ETRs register longer prefixes inside it (used for host mobility).</p>

<h3>Step 2: the xTRs</h3>
<pre class="code">XTR1(config)# router lisp
XTR1(config-router-lisp)# service ipv4
<span class="c">! ITR role: where to send Map-Requests</span>
XTR1(config-lisp-srv-ipv4)#  itr map-resolver 100.64.3.2
XTR1(config-lisp-srv-ipv4)#  itr
<span class="c">! ETR role: where to register, with the site key</span>
XTR1(config-lisp-srv-ipv4)#  etr map-server 100.64.3.2 key NK-LISP
XTR1(config-lisp-srv-ipv4)#  etr
<span class="c">! local EID prefix, its RLOC, priority and weight</span>
XTR1(config-lisp-srv-ipv4)#  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
XTR1(config-lisp-srv-ipv4)#  exit-service-ipv4</pre>
<p>XTR2 is identical except for <code>database-mapping 10.2.2.0/24 100.64.2.2 priority 1 weight 100</code>. The RLOC in the database-mapping must be an address configured on the xTR itself; you can also write the interface name, for example <code>database-mapping 10.1.1.0/24 IPv4-interface GigabitEthernet0/0 priority 1 weight 100</code>, which avoids typos.</p>

<h3>The classic syntax you will see in books</h3>
<p>Older IOS and many ENCOR study guides use the <b>eid-table</b> style, where the instance ID and EID VRF are explicit. It does the same thing:</p>
<pre class="code">router lisp
 eid-table default instance-id 0
  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
  exit
 ipv4 itr map-resolver 100.64.3.2
 ipv4 itr
 ipv4 etr map-server 100.64.3.2 key NK-LISP
 ipv4 etr
<span class="c">! on the MS/MR the roles become:</span>
 ipv4 map-server
 ipv4 map-resolver</pre>
<p>For a second VRF you add <code>eid-table vrf RED instance-id 101</code>; its EIDs are carried with instance ID 101 in the LISP header, so overlapping addresses in different VRFs never mix.</p>

<h3>Step 3: verification, in the order a packet needs it</h3>
<p><b>1. Is the xTR a LISP router with the right roles?</b></p>
<pre class="out">XTR1# show ip lisp
  Instance ID:                         0
  Router-lisp ID:                      0
  Locator table:                       default
  EID table:                           default
<span class="hl">  Ingress Tunnel Router (ITR):         enabled
  Egress Tunnel Router (ETR):          enabled</span>
  Proxy-ITR Router (PITR):             disabled
  Proxy-ETR Router (PETR):             disabled
  Map Server (MS):                     disabled
  Map Resolver (MR):                   disabled
  ITR Map-Resolver(s):                 100.64.3.2
  ETR Map-Server(s):                   100.64.3.2 (00:00:21)</pre>

<p><b>2. What does the ETR want to register?</b></p>
<pre class="out">XTR1# show ip lisp database
LISP ETR IPv4 Mapping Database for EID-table default (IID 0), LSBs: 0x1, 1 entries

10.1.1.0/24
  Locator       Pri/Wgt  Source     State
<span class="hl">  100.64.1.2      1/100  cfg-addr   site-self, reachable</span></pre>
<p>"site-self" means the locator is one of this router's own addresses. That is required for the ETR to register it.</p>

<p><b>3. Did the map-server accept it?</b></p>
<pre class="out">MSMR# show lisp site
LISP Site Registration Information
* = Some locators are down or unreachable
# = Some registrations are sourced by reliable transport

Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
<span class="hl">SITE-A         00:00:37  yes    100.64.1.2:17294              10.1.1.0/24
SITE-B         00:00:41  yes    100.64.2.2:23456              10.2.2.0/24</span></pre>

<p><b>4. After traffic: did the ITR learn the remote EID?</b> Run <code>show ip lisp map-cache</code> on XTR1 and look for 10.2.2.0/24 via map-reply with locator 100.64.2.2 "up". Then confirm the core is still clean: <code>show ip route 10.2.2.0</code> on CORE must say "Subnet not in table".</p>

<div class="eg"><p><b>Worked example: reading "Last Register".</b> ETRs refresh every 60 seconds, so "Last Register" should always be below about 1 minute. If you see 00:02:40 and climbing, the ETR stopped registering (key changed, RLOC unreachable, ETR role removed). At about 3 minutes the entry expires and "Up" becomes "no".</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>itr map-resolver</code> and <code>etr map-server</code> but forgetting the bare <code>itr</code> and <code>etr</code> lines. The addresses are stored, but the roles stay disabled, so nothing registers and nothing is resolved. <code>show ip lisp</code> shows "disabled" immediately.</p></div>

<div class="exam"><p><b>Exam trap.</b> The key on the xTR goes on the <code>etr map-server</code> line; on the MS it goes under the <code>site</code> as <code>authentication-key</code>. The ITR needs no key to send Map-Requests. And <code>show lisp site</code> is a map-server command; running it on an xTR shows nothing useful.</p></div>

<div class="scn"><h4>The copy-paste RLOC</h4><p>An engineer built ten branch xTRs from one template. Nine registered, one did not, and the map-server logged no errors. <code>show ip lisp database</code> on the silent branch showed the locator as "site-other" instead of "site-self": the template still contained the RLOC of the previous branch. An ETR does not register a mapping whose locators are not its own, so the MS never heard anything. Using <code>IPv4-interface GigabitEthernet0/0</code> in the template instead of a literal address prevented a repeat.</p><p><b>Lesson:</b> no MS error plus no registration usually means the ETR never sent one. Check the database first.</p></div>

<div class="iv"><p class="q">"What is the minimum configuration to bring up a LISP site, and how do you verify it?"</p><p>Strong answer: on the MS/MR, a site with eid-prefix and authentication-key, plus the map-server and map-resolver roles. On the xTR, itr map-resolver, itr, etr map-server with key, etr and database-mapping EID-prefix RLOC priority weight. Verify with show ip lisp for roles, show ip lisp database for site-self locators, show lisp site on the MS for registration, and show ip lisp map-cache after traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay reachability between RLOCs and the MS/MR comes first.</li>
<li>MS/MR: <code>site</code> with <code>authentication-key</code> and <code>eid-prefix</code>, then <code>map-server</code> and <code>map-resolver</code>.</li>
<li>xTR: <code>itr map-resolver</code>, <code>itr</code>, <code>etr map-server … key</code>, <code>etr</code>, <code>database-mapping</code>.</li>
<li>Classic syntax uses <code>eid-table default instance-id 0</code> and <code>ipv4 itr/etr</code>.</li>
<li>Verify in order: show ip lisp, show ip lisp database, show lisp site, show ip lisp map-cache.</li>
</ul></div>
`,hi:`
<p>LISP configure karna courier company ki nayi branch kholne jaisa hai. Pehle head office branch ka account banata hai aur use password deta hai (map-server par site aur key). Phir branch head office ko batati hai woh kaunse customers serve karti hai (database-mapping) aur baaki sabke baare mein kahan poochna hai (map-resolver). Jab tak dono side password par sehmat na hon, kuch nahi chalta.</p>

<h3>Step 0: pehle underlay chalna chahiye</h3>
<p>Har RLOC ko MS/MR aur har doosre RLOC tak pahunchna chahiye. Lab mein CORE par OSPF 100.64.0.0/16 links advertise karta hai. LISP chhoone se pehle har xTR par <code>ping 100.64.3.2 source GigabitEthernet0/0</code> chalao. Agar yeh fail ho, ruk jao aur OSPF theek karo: LISP toote underlay ko theek nahi kar sakta.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="xTR aur MS mein kya match hona chahiye">
<rect x="20" y="20" width="260" height="150" rx="10" fill="#bae6fd"/><text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">XTR2</text>
<text x="150" y="72" text-anchor="middle" class="svg-muted" font-size="12">etr map-server 100.64.3.2</text>
<text x="150" y="94" text-anchor="middle" class="svg-accent" font-size="12">key NK-LISP</text>
<text x="150" y="116" text-anchor="middle" class="svg-accent" font-size="12">database-mapping 10.2.2.0/24</text>
<text x="150" y="138" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.2.2 (apna address)</text>
<rect x="360" y="20" width="260" height="150" rx="10" fill="#ddd6fe"/><text x="490" y="44" text-anchor="middle" class="svg-ink" font-size="14">MSMR</text>
<text x="490" y="72" text-anchor="middle" class="svg-muted" font-size="12">site SITE-B</text>
<text x="490" y="94" text-anchor="middle" class="svg-accent" font-size="12">authentication-key NK-LISP</text>
<text x="490" y="116" text-anchor="middle" class="svg-accent" font-size="12">eid-prefix 10.2.2.0/24</text>
<text x="490" y="138" text-anchor="middle" class="svg-muted" font-size="12">map-server, map-resolver</text>
<line x1="250" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="112" x2="390" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">key aur EID prefix match hone chahiye, warna Map-Register reject</text>
</svg><p class="cap">Do cheezein jin par ETR aur uske map-server ko sehmat hona chahiye.</p></div>

<h3>Step 1: map-server aur map-resolver (MSMR)</h3>
<pre class="code">MSMR(config)# router lisp
<span class="c">! har customer site ke liye ek site object: allowed EID prefixes + key</span>
MSMR(config-router-lisp)# site SITE-A
MSMR(config-router-lisp-site)#  authentication-key NK-LISP
MSMR(config-router-lisp-site)#  eid-prefix 10.1.1.0/24
MSMR(config-router-lisp-site)#  exit-site
MSMR(config-router-lisp)# site SITE-B
MSMR(config-router-lisp-site)#  authentication-key NK-LISP
MSMR(config-router-lisp-site)#  eid-prefix 10.2.2.0/24
MSMR(config-router-lisp-site)#  exit-site
<span class="c">! IPv4 EIDs ke liye dono roles chalu karo</span>
MSMR(config-router-lisp)# service ipv4
MSMR(config-lisp-srv-ipv4)#  map-server
MSMR(config-lisp-srv-ipv4)#  map-resolver
MSMR(config-lisp-srv-ipv4)#  exit-service-ipv4</pre>
<p><code>site</code> security boundary hai. ETR sirf wahi prefixes register kar sakta hai jo kisi site ke <code>eid-prefix</code> ke andar aate hain, aur sirf us site ki key ke saath. <code>eid-prefix</code> ke neeche <code>accept-more-specifics</code> jodne se ETRs uske andar lambe prefixes register kar sakte hain (host mobility ke liye use hota hai).</p>

<h3>Step 2: xTRs</h3>
<pre class="code">XTR1(config)# router lisp
XTR1(config-router-lisp)# service ipv4
<span class="c">! ITR role: Map-Requests kahan bhejne hain</span>
XTR1(config-lisp-srv-ipv4)#  itr map-resolver 100.64.3.2
XTR1(config-lisp-srv-ipv4)#  itr
<span class="c">! ETR role: kahan register karna hai, site key ke saath</span>
XTR1(config-lisp-srv-ipv4)#  etr map-server 100.64.3.2 key NK-LISP
XTR1(config-lisp-srv-ipv4)#  etr
<span class="c">! local EID prefix, uska RLOC, priority aur weight</span>
XTR1(config-lisp-srv-ipv4)#  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
XTR1(config-lisp-srv-ipv4)#  exit-service-ipv4</pre>
<p>XTR2 bilkul same hai, bas <code>database-mapping 10.2.2.0/24 100.64.2.2 priority 1 weight 100</code>. Database-mapping ka RLOC xTR par hi configured address hona chahiye; aap interface ka naam bhi likh sakte ho, jaise <code>database-mapping 10.1.1.0/24 IPv4-interface GigabitEthernet0/0 priority 1 weight 100</code>, jisse typos se bachte ho.</p>

<h3>Classic syntax jo books mein dikhega</h3>
<p>Purane IOS aur kai ENCOR study guides <b>eid-table</b> style use karte hain, jahan instance ID aur EID VRF explicit hote hain. Kaam wahi hai:</p>
<pre class="code">router lisp
 eid-table default instance-id 0
  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
  exit
 ipv4 itr map-resolver 100.64.3.2
 ipv4 itr
 ipv4 etr map-server 100.64.3.2 key NK-LISP
 ipv4 etr
<span class="c">! MS/MR par roles aise bante hain:</span>
 ipv4 map-server
 ipv4 map-resolver</pre>
<p>Doosre VRF ke liye aap <code>eid-table vrf RED instance-id 101</code> jodte ho; uske EIDs LISP header mein instance ID 101 ke saath jaate hain, isliye alag VRFs ke overlapping addresses kabhi nahi milte.</p>

<h3>Step 3: verification, usi order mein jismein packet ko zaroorat hai</h3>
<p><b>1. Kya xTR sahi roles ke saath LISP router hai?</b></p>
<pre class="out">XTR1# show ip lisp
  Instance ID:                         0
  Router-lisp ID:                      0
  Locator table:                       default
  EID table:                           default
<span class="hl">  Ingress Tunnel Router (ITR):         enabled
  Egress Tunnel Router (ETR):          enabled</span>
  Proxy-ITR Router (PITR):             disabled
  Proxy-ETR Router (PETR):             disabled
  Map Server (MS):                     disabled
  Map Resolver (MR):                   disabled
  ITR Map-Resolver(s):                 100.64.3.2
  ETR Map-Server(s):                   100.64.3.2 (00:00:21)</pre>

<p><b>2. ETR kya register karna chahta hai?</b></p>
<pre class="out">XTR1# show ip lisp database
LISP ETR IPv4 Mapping Database for EID-table default (IID 0), LSBs: 0x1, 1 entries

10.1.1.0/24
  Locator       Pri/Wgt  Source     State
<span class="hl">  100.64.1.2      1/100  cfg-addr   site-self, reachable</span></pre>
<p>"site-self" ka matlab locator is router ka apna address hai. ETR ko use register karne ke liye yeh zaroori hai.</p>

<p><b>3. Kya map-server ne use accept kiya?</b></p>
<pre class="out">MSMR# show lisp site
LISP Site Registration Information
* = Some locators are down or unreachable
# = Some registrations are sourced by reliable transport

Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
<span class="hl">SITE-A         00:00:37  yes    100.64.1.2:17294              10.1.1.0/24
SITE-B         00:00:41  yes    100.64.2.2:23456              10.2.2.0/24</span></pre>

<p><b>4. Traffic ke baad: kya ITR ne remote EID seekha?</b> XTR1 par <code>show ip lisp map-cache</code> chalao aur 10.2.2.0/24 via map-reply locator 100.64.2.2 "up" ke saath dhoondo. Phir confirm karo ki core ab bhi saaf hai: CORE par <code>show ip route 10.2.2.0</code> ko "Subnet not in table" kehna chahiye.</p>

<div class="eg"><p><b>Worked example: "Last Register" padhna.</b> ETRs har 60 second refresh karte hain, isliye "Last Register" hamesha lagbhag 1 minute se kam hona chahiye. Agar aap 00:02:40 dekho aur badhta hua, to ETR ne register karna band kar diya (key badli, RLOC unreachable, ETR role hat gaya). Lagbhag 3 minute par entry expire hoti hai aur "Up" "no" ban jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>itr map-resolver</code> aur <code>etr map-server</code> configure karna lekin akeli <code>itr</code> aur <code>etr</code> lines bhool jaana. Addresses store ho jaate hain, lekin roles disabled rehte hain, isliye na kuch register hota hai na resolve. <code>show ip lisp</code> turant "disabled" dikhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> xTR par key <code>etr map-server</code> line par jaati hai; MS par <code>site</code> ke neeche <code>authentication-key</code> ki tarah. ITR ko Map-Requests bhejne ke liye koi key nahi chahiye. Aur <code>show lisp site</code> map-server command hai; xTR par chalane se kuch kaam ka nahi dikhta.</p></div>

<div class="scn"><h4>Copy-paste wala RLOC</h4><p>Ek engineer ne ek template se das branch xTRs banaye. Nau register hue, ek nahi, aur map-server ne koi error log nahi kiya. Chup branch par <code>show ip lisp database</code> ne locator ko "site-self" ki jagah "site-other" dikhaya: template mein ab bhi pichhli branch ka RLOC tha. ETR aisi mapping register nahi karta jiske locators uske apne nahi hain, isliye MS ne kabhi kuch suna hi nahi. Template mein literal address ki jagah <code>IPv4-interface GigabitEthernet0/0</code> use karne se yeh dobara nahi hua.</p><p><b>Seekh:</b> MS par koi error nahi plus koi registration nahi ka matlab aksar yeh hai ki ETR ne kabhi bheja hi nahi. Pehle database check karo.</p></div>

<div class="iv"><p class="q">"LISP site up karne ke liye minimum configuration kya hai, aur use kaise verify karte ho?"</p><p>Strong answer: MS/MR par eid-prefix aur authentication-key wali site, plus map-server aur map-resolver roles. xTR par itr map-resolver, itr, key ke saath etr map-server, etr aur database-mapping EID-prefix RLOC priority weight. Verify karo show ip lisp se roles, show ip lisp database se site-self locators, MS par show lisp site se registration, aur traffic ke baad show ip lisp map-cache.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sabse pehle RLOCs aur MS/MR ke beech underlay reachability.</li>
<li>MS/MR: <code>authentication-key</code> aur <code>eid-prefix</code> wali <code>site</code>, phir <code>map-server</code> aur <code>map-resolver</code>.</li>
<li>xTR: <code>itr map-resolver</code>, <code>itr</code>, <code>etr map-server … key</code>, <code>etr</code>, <code>database-mapping</code>.</li>
<li>Classic syntax <code>eid-table default instance-id 0</code> aur <code>ipv4 itr/etr</code> use karta hai.</li>
<li>Is order mein verify karo: show ip lisp, show ip lisp database, show lisp site, show ip lisp map-cache.</li>
</ul></div>
`}};export{e as default};