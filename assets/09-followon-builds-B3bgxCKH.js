var e={id:`followon-builds`,h:{en:`Follow-on builds B, D, E and F: four design briefs`,hi:`Aage ke builds B, D, E aur F: chaar design briefs`},body:{en:`
<p>Builds A and C are done. Four more projects use the same chain, and each is a good portfolio piece. They are <b>design briefs only</b>: there is no lab for them, and nothing below was run in the course labs as a whole. Every building block named in a brief did work in a module lab, and the briefs say which one. Use a brief the way a senior engineer would: read the goal, check the reuse, find the hard decision, and build the first milestone before you plan the rest.</p>

<h3>Build B: compliance and drift for the whole estate</h3>
<p><b>Goal.</b> Every night, every device in NetBox is read back and compared with what NetBox says. The output is one report and one ticket per drifting device.</p>
<p><b>Reuse.</b> The <code>verify</code> action of this module, scaled from two routers to the estate with a Nornir filter per site; <code>adv-netbox</code> for the data, <code>adv-napalm</code> getters for the read-back, <code>py-capstone</code> for the report idea.</p>
<p><b>The hard decision.</b> What counts as drift? A device may carry lines that NetBox does not know about (a local debug account, a vendor default). Decide between a <i>whitelist</i> (only these facts are compared, as in this toolkit) and a <i>golden config</i> (the whole file is compared). The whitelist produces few alarms and misses a lot; the golden config catches everything and shouts constantly. Start with the whitelist, grow it one fact at a time.</p>
<p><b>First milestone.</b> Run the verify for one site, write the JSON report, and make the exit code 1 when anything drifts. Ticketing comes second.</p>

<h3>Build D: a self-service API in front of the toolkit</h3>
<p><b>Goal.</b> A site engineer asks for a branch change through a small web service. The service validates the request, queues it, and returns a job id; the toolkit does the work.</p>
<p><b>Reuse.</b> <code>adv-fastapi</code> for the service and its tests, the schema file of this module as the request model, <code>adv-vault</code> for the secrets the service must never see, <code>mvtool.py plan</code> as the preview.</p>
<p><b>The hard decision.</b> Who is allowed to apply, and who approves? An API makes it easy to change a network from a phone. The safe design keeps three verbs apart: <i>request</i> (anyone with a token), <i>plan</i> (the toolkit, read-only, result stored with the job) and <i>apply</i> (only after a named approver confirms the stored plan). Never run the apply inside the request handler: it is slow, it can fail half-way, and a web timeout must not decide the state of a router.</p>
<p><b>First milestone.</b> Accept a request, run the gate and the plan in a background job, and return the diff. No apply endpoint yet.</p>

<h3>Build E: a data-centre fabric on Arista EOS</h3>
<p><b>Goal.</b> A leaf-and-spine fabric of EOS switches is described in NetBox (devices, interfaces, point-to-point addresses, ASNs). The toolkit renders the underlay and the BGP configuration and checks that the neighbours come up.</p>
<p><b>Reuse.</b> The templates and gate of this module, one template per role (leaf, spine), the NAPALM EOS driver, <code>adv-pyeapi</code> for rich read-back, <code>adv-gnmi</code> for streaming checks.</p>
<p><b>The hard decision.</b> The change order. A fabric is a set of devices that depend on each other: configure a spine's BGP before its leaves exist and you see nothing; configure every device at once and a typo takes the whole fabric down. Use Nornir filters to apply one leaf first (a <i>canary</i>), verify its BGP neighbours, then continue in small batches, and stop the run on the first failed read-back.</p>
<p><b>First milestone.</b> Two leaves and one spine in a lab: render, gate with Batfish, apply the canary, verify the session state.</p>

<h3>Build F: AWS connectivity, checked before it is built</h3>
<p><b>Goal.</b> A request describes a VPC, subnets and routes towards the data centre. The toolkit checks the plan for overlap with on-premises ranges before boto3 creates anything.</p>
<p><b>Reuse.</b> <code>adv-boto3</code> for the calls and the read-back, the address-plan stage of this gate (extended with the prefixes NetBox already holds), <code>adv-verify</code> for the schema pattern.</p>
<p><b>The hard decision.</b> State. Cloud resources have no candidate configuration and no rollback command. You need a record of what the toolkit created (ids and a change number as a tag), so that a failed run can be undone by removing exactly those resources. Prefer tags over names for ownership.</p>
<p><b>First milestone.</b> A dry run that reads the account, lists overlaps with NetBox prefixes and creates nothing.</p>

<div class="warn"><p><b>Design briefs are not designs you have proven.</b> In your portfolio, label them as briefs. Show the one milestone that you built and run, and describe the rest as a plan. Interviewers value honest scope more than a long list of things that were never run.</p></div>

<div class="scn"><h4>Starting with the API</h4><p>A team began build D first because a web service looked impressive. Three weeks later the service accepted requests, but nothing behind it was safe to run unattended: no gate, no read-back, no rollback. The first demo applied a request that the service validated and the network rejected. They restarted with the chain, ran it from the command line for a month, and put the API on top at the end.</p><p><b>Lesson:</b> the front door comes last. A safe chain behind a plain command line beats a nice API in front of an unsafe one.</p></div>

<div class="iv"><p class="q">"You have a working branch toolkit. What would you build next, and why?"</p><p>First the nightly compliance run, because it reuses the verify stage, adds no risk (it is read-only) and shows value quickly. Then a firewall change pipeline, because requests are repetitive and auditable. A self-service API only at the end, when the chain behind it is tested and has an approval step. Each project reuses the same chain, so the investment is in the gate, the read-back and the tests.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>B, D, E and F are design briefs; each names the reuse, the hard decision and a first milestone.</li>
<li>B: choose whitelist or golden config before you count alarms.</li>
<li>D: keep request, plan and apply separate; never apply in the request handler.</li>
<li>E: change order is the design; use a canary and stop on the first failed read-back.</li>
<li>F: record what you created, tag it, and check overlaps before building.</li>
</ul></div>
`,hi:`
<p>Builds A aur C ho chuke. Chaar aur projects wahi chain use karte hain, aur har ek achha portfolio piece hai. Yeh <b>sirf design briefs</b> hain: inke liye lab nahi hai, aur neeche ka kuch bhi course labs mein poora nahi chalaya gaya. Har brief mein jo building block naam hai woh kisi module lab mein kaam kar chuka hai, aur brief batata hai kaunse. Brief ko senior engineer ki tarah use karo: goal padho, reuse check karo, mushkil faisla dhoondho, aur baaki plan se pehle pehla milestone banao.</p>

<h3>Build B: poori estate ke liye compliance aur drift</h3>
<p><b>Goal.</b> Har raat NetBox ka har device wapas padha jata hai aur NetBox jo kehta hai usse compare hota hai. Output ek report aur drift karne wale har device ka ek ticket hai.</p>
<p><b>Reuse.</b> Is module ka <code>verify</code> action, do routers se estate tak, har site ke liye Nornir filter ke saath; data ke liye <code>adv-netbox</code>, read-back ke liye <code>adv-napalm</code> getters, report ke idea ke liye <code>py-capstone</code>.</p>
<p><b>Mushkil faisla.</b> Drift kise kehte hain? Device par aisi lines ho sakti hain jo NetBox nahi jaanta (local debug account, vendor default). <i>Whitelist</i> (sirf yeh facts compare hote hain, jaise is toolkit mein) aur <i>golden config</i> (poori file compare hoti hai) ke beech chuno. Whitelist kam alarm deti hai aur bahut kuch chhod deti hai; golden config sab pakadti hai aur lagatar shor machati hai. Whitelist se shuru karo, ek ek fact badhao.</p>
<p><b>Pehla milestone.</b> Ek site ka verify chalao, JSON report likho, aur kuch bhi drift ho to exit code 1 karo. Ticketing baad mein.</p>

<h3>Build D: toolkit ke aage self-service API</h3>
<p><b>Goal.</b> Site engineer chhoti web service se branch change maangta hai. Service request validate karti hai, queue karti hai aur job id lautati hai; kaam toolkit karti hai.</p>
<p><b>Reuse.</b> Service aur uske tests ke liye <code>adv-fastapi</code>, is module ki schema file request model ki tarah, un secrets ke liye <code>adv-vault</code> jo service ko kabhi nahi dikhne chahiye, preview ke liye <code>mvtool.py plan</code>.</p>
<p><b>Mushkil faisla.</b> Apply kaun kar sakta hai, aur approve kaun karta hai? API phone se network badalna aasaan bana deta hai. Safe design teen verbs ko alag rakhta hai: <i>request</i> (token wala koi bhi), <i>plan</i> (toolkit, read-only, result job ke saath store) aur <i>apply</i> (sirf tab jab naam wala approver stored plan confirm kare). Apply ko request handler ke andar kabhi mat chalao: woh dheema hai, beech mein fail ho sakta hai, aur web timeout router ki state tay na kare.</p>
<p><b>Pehla milestone.</b> Request lo, background job mein gate aur plan chalao, aur diff lautao. Abhi apply endpoint nahi.</p>

<h3>Build E: Arista EOS par data-centre fabric</h3>
<p><b>Goal.</b> EOS switches ka leaf-and-spine fabric NetBox mein describe hai (devices, interfaces, point-to-point addresses, ASNs). Toolkit underlay aur BGP configuration render karti hai aur check karti hai ki neighbours up aate hain.</p>
<p><b>Reuse.</b> Is module ke templates aur gate, har role (leaf, spine) ka ek template, NAPALM EOS driver, gehre read-back ke liye <code>adv-pyeapi</code>, streaming checks ke liye <code>adv-gnmi</code>.</p>
<p><b>Mushkil faisla.</b> Change ka kram. Fabric aise devices ka set hai jo ek doosre par nirbhar hain: leaves ke bante hi spine ka BGP configure karo to kuch dikhta nahi; saare devices ek saath configure karo to ek typo poora fabric gira deta hai. Nornir filters se pehle ek leaf apply karo (<i>canary</i>), uske BGP neighbours verify karo, phir chhote batches mein badho, aur pehle fail hue read-back par run rok do.</p>
<p><b>Pehla milestone.</b> Lab mein do leaves aur ek spine: render, Batfish se gate, canary apply, session state verify.</p>

<h3>Build F: AWS connectivity, banane se pehle check</h3>
<p><b>Goal.</b> Request ek VPC, subnets aur data centre ki taraf routes batati hai. Toolkit boto3 kuch banaye us se pehle plan ko on-premises ranges ke overlap ke liye check karti hai.</p>
<p><b>Reuse.</b> Calls aur read-back ke liye <code>adv-boto3</code>, is gate ka address-plan stage (NetBox ke pehle se maujood prefixes jodkar), schema pattern ke liye <code>adv-verify</code>.</p>
<p><b>Mushkil faisla.</b> State. Cloud resources ke paas na candidate configuration hai na rollback command. Aapko record chahiye ki toolkit ne kya banaya (ids aur change number tag ki tarah), taaki fail hui run ko exactly un resources ko hatakar undo kiya ja sake. Ownership ke liye naam ki jagah tags prefer karo.</p>
<p><b>Pehla milestone.</b> Dry run jo account padhe, NetBox prefixes ke saath overlaps list kare aur kuch na banaye.</p>

<div class="warn"><p><b>Design briefs saabit design nahi hain.</b> Portfolio mein inhe briefs hi likho. Jo ek milestone aapne banaya aur chalaya woh dikhao, baaki ko plan batao. Interviewers lambi list se zyada imaandar scope ko value dete hain, jo kabhi chali hi nahi.</p></div>

<div class="scn"><h4>API se shuru karna</h4><p>Ek team ne build D pehle shuru kiya kyunki web service impressive lagti thi. Teen hafte baad service requests le rahi thi, par uske peeche kuch bhi bina dekhe chalane layak safe nahi tha: na gate, na read-back, na rollback. Pehla demo aisi request apply kar gaya jise service ne validate kiya aur network ne reject kiya. Unhone chain se dobara shuru kiya, ek mahina command line se chalayi, aur API ant mein upar rakhi.</p><p><b>Lesson:</b> front door sabse aakhir mein. Plain command line ke peeche safe chain, asafe chain ke aage sundar API se behtar hai.</p></div>

<div class="iv"><p class="q">"Aapke paas chalti hui branch toolkit hai. Agla kya banaoge, aur kyon?"</p><p>Pehle nightly compliance run, kyunki woh verify stage reuse karta hai, risk nahi jodta (read-only) aur jaldi value dikhata hai. Phir firewall change pipeline, kyunki requests dohrati hain aur audit-yogya hain. Self-service API sirf ant mein, jab uske peeche chain tested ho aur approval step ho. Har project wahi chain reuse karta hai, isliye investment gate, read-back aur tests mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>B, D, E aur F design briefs hain; har ek reuse, mushkil faisla aur pehla milestone batata hai.</li>
<li>B: alarms ginne se pehle whitelist ya golden config chuno.</li>
<li>D: request, plan aur apply alag; apply request handler mein kabhi nahi.</li>
<li>E: change ka kram hi design hai; canary lo aur pehle fail hue read-back par ruko.</li>
<li>F: jo banaya woh record karo, tag karo, aur banane se pehle overlap check karo.</li>
</ul></div>
`}};export{e as default};