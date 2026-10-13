var e=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="svg-`+(r||`ink`)+`" font-size="`+(r===`muted`?11:12)+`">`+n+`</text>`,t=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,n=[`#bae6fd`,`#fed7aa`,`#ddd6fe`,`#bbf7d0`,`#e2e8f0`],r=r=>{let i=``;for(let t=0;t<5;t++){let a=14+t*46;i+=`<rect x="14" y="`+a+`" width="150" height="36" rx="6" fill="`+n[t]+`" stroke="#475569" stroke-width="1.5"/>`+e(89,a+22,r[1+t])+`<line x1="164" y1="`+(a+18)+`" x2="190" y2="`+(a+18)+`" stroke="#64748b" stroke-width="2"/>`+e(200,a+22,r[6+t],`ink`,`start`)}return i+=t(14,262,`#e2e8f0`,r[11]),`<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="`+r[0]+`"><desc>`+r[0]+`</desc>`+i+`</svg><p class="cap">`+r[12]+`</p></div>`},i={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist: AI network design`,hi:`Summary aur exam checklist: AI network design`},body:{en:`
<h3>Capstone case: Cedar Analytics</h3>
<p>Cedar Analytics, a mid-size fintech, asks you to design its first AI platform: 512 GPUs for fraud-model training, an inference service for 300 analysts and a regulator who requires customer data to stay in the country. The CTO has a 12-month target and a hall with limited power. Use the five questions below in order. They are the structure of an answer in the practical exam.</p>

@@DIA@@

<h3>Can-do checklist</h3>
<ul><li>Explain why training traffic (synchronised collectives, elephant flows, incast) differs from inference traffic.</li><li>Separate back-end, front-end, storage and management networks and justify each as a failure domain.</li><li>Choose between fat-tree, rail-optimised and oversubscribed designs and say where oversubscription is acceptable.</li><li>Compare InfiniBand and Ethernet with RoCE and say what the choice depends on.</li><li>Describe PFC, ECN and DCQCN, and the rule ECN first, PFC last.</li><li>Compare ECMP, more entropy, flowlets, packet spraying and dynamic load balancing.</li><li>Link power, cooling, rack density, cable reach and optics to pod size.</li><li>Place data, training, inference, prompts and logs under a sovereignty rule.</li><li>Propose AIOps use with human control and guardrails.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>All-reduce</dt><dd>A collective that sums values from all GPUs and shares the result.</dd><dt>Incast</dt><dd>Many senders to one receiver, overloading one egress queue.</dd><dt>Rail-optimised</dt><dd>GPU number N of every server attaches to the same leaf group.</dd><dt>RoCEv2</dt><dd>RDMA carried over UDP and routed IP.</dd><dt>PFC</dt><dd>Per-priority pause that prevents drops but can spread congestion.</dd><dt>ECN</dt><dd>Marks packets at a queue threshold instead of dropping.</dd><dt>DCQCN</dt><dd>Sender-NIC rate control that reacts to ECN feedback.</dd><dt>Flowlet</dt><dd>A burst of a flow separated by an idle gap, which can be re-routed safely.</dd><dt>Scale-up</dt><dd>Bigger node with a fast internal GPU interconnect.</dd><dt>Scale-out</dt><dd>More nodes joined by the fabric.</dd><dt>Data gravity</dt><dd>Large data attracts compute to it.</dd><dt>AIOps</dt><dd>Pattern recognition applied to operational telemetry.</dd></dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Traffic</td><td>Training is synchronised east-west; the slowest flow sets job time; inference is user-facing</td></tr>
<tr><td>Topology</td><td>Back-end normally non-blocking; oversubscription suits front-end and storage; pods extend two-tier limits</td></tr>
<tr><td>Lossless</td><td>ECN threshold below PFC threshold; add a PFC watchdog; headroom depends on speed and distance</td></tr>
<tr><td>Load balancing</td><td>ECMP suffers from low entropy; spraying needs reorder-tolerant NICs</td></tr>
<tr><td>Facility</td><td>Power and cooling usually limit scale before the network does</td></tr>
<tr><td>Sovereignty</td><td>Prompts and logs are data too; move compute to data</td></tr>
<tr><td>AIOps</td><td>Advisory first; closed loop only with guardrails</td></tr></table>

<div class="warn"><p><b>Post-mortem of a wrong answer.</b> A candidate in a mock practical picked InfiniBand because it is "faster" and ignored the stated team skills and multi-vendor requirement. The defence collapsed under questioning. Always tie the choice to the stated requirements and constraints, and say when it depends.</p></div>

<div class="exam"><p><b>Exam trap.</b> Do not memorise a favourite design. Every answer in this domain is a trade-off: name what it optimises, what it sacrifices, and what would change your mind.</p></div>

<div class="scn"><h4>The one-page defence</h4><p>For Cedar Analytics a strong answer fits on one page: dedicated rail-optimised back-end fabric with ECN first and PFC as a safety net; front-end and storage separate with moderate oversubscription; a staged pod plan sized to power; training and logs in the sovereign data center; advisory AIOps. The reviewer accepted it because each choice referenced a requirement and a constraint.</p><p><b>Lesson:</b> structure beats volume.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design an AI fabric from scratch."</p><p>Strong answer: workload and stakeholders first; requirements and constraints; separate networks; topology and oversubscription; transport and congestion control; load balancing; facility limits; data placement; operations. Finish with risks and migration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Start with workload, requirements and constraints, not products.</li><li>Back-end: non-blocking, lossless-aware, congestion-controlled and telemetry-rich.</li><li>Facility and data-law constraints can override the ideal network.</li><li>Always present options, trade-offs, the choice and the pushback answer.</li><li>Say clearly when the answer depends, and on what.</li></ul></div>
`.replace(`@@DIA@@`,r([`Five design questions for any AI platform`,`Traffic`,`Topology`,`Congestion`,`Facility`,`Placement`,`Training or inference? Which network?`,`Rails, tiers, oversubscription, pods?`,`ECN, PFC, load balancing, telemetry?`,`Power, cooling, optics, reach?`,`Where do data, models and logs live?`,`Ask in order`,`Work the five questions in order; each answer narrows the next and gives you the structure of a defensible design.`])),hi:`
<h3>Capstone case: Cedar Analytics</h3>
<p>Cedar Analytics, ek mid-size fintech, aapse apna pehla AI platform design karwata hai: fraud-model training ke liye 512 GPUs, 300 analysts ke liye inference service, aur ek regulator jo chahta hai ki customer data desh ke andar rahe. CTO ka 12 mahine ka target hai aur hall mein power limited hai. Neeche ke paanch sawal order mein use karo. Yahi practical exam mein answer ka structure hai.</p>

@@DIA@@

<h3>Can-do checklist</h3>
<ul><li>Samjhao ki training traffic (synchronised collectives, elephant flows, incast) inference traffic se kyun alag hai.</li><li>Back-end, front-end, storage aur management networks alag karo aur har ek ko failure domain ke roop mein justify karo.</li><li>Fat-tree, rail-optimised aur oversubscribed designs mein se chuno aur batao oversubscription kahan acceptable hai.</li><li>InfiniBand aur RoCE wale Ethernet ko compare karo aur batao choice kis par depend karti hai.</li><li>PFC, ECN aur DCQCN describe karo, aur rule ECN first, PFC last.</li><li>ECMP, more entropy, flowlets, packet spraying aur dynamic load balancing compare karo.</li><li>Power, cooling, rack density, cable reach aur optics ko pod size se jodo.</li><li>Sovereignty rule ke under data, training, inference, prompts aur logs place karo.</li><li>Human control aur guardrails ke saath AIOps use propose karo.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>All-reduce</dt><dd>Collective jo saare GPUs ki values jodta hai aur result share karta hai.</dd><dt>Incast</dt><dd>Kai senders se ek receiver, jo ek egress queue overload karta hai.</dd><dt>Rail-optimised</dt><dd>Har server ka GPU number N ek hi leaf group se jud jata hai.</dd><dt>RoCEv2</dt><dd>UDP aur routed IP par carry hone wala RDMA.</dd><dt>PFC</dt><dd>Per-priority pause jo drops rokta hai lekin congestion phaila sakta hai.</dd><dt>ECN</dt><dd>Queue threshold par packets drop karne ki jagah mark karta hai.</dd><dt>DCQCN</dt><dd>Sender-NIC rate control jo ECN feedback par react karta hai.</dd><dt>Flowlet</dt><dd>Idle gap se alag hua flow ka burst, jise safely re-route kar sakte hain.</dd><dt>Scale-up</dt><dd>Fast internal GPU interconnect wala bada node.</dd><dt>Scale-out</dt><dd>Fabric se jude zyada nodes.</dd><dt>Data gravity</dt><dd>Bada data compute ko apni taraf kheenchta hai.</dd><dt>AIOps</dt><dd>Operational telemetry par lagaya gaya pattern recognition.</dd></dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Traffic</td><td>Training synchronised east-west hai; slowest flow job time tay karta hai; inference user-facing hai</td></tr>
<tr><td>Topology</td><td>Back-end normally non-blocking; oversubscription front-end aur storage ke liye; pods two-tier limits badhate hain</td></tr>
<tr><td>Lossless</td><td>ECN threshold PFC threshold se neeche; PFC watchdog lagao; headroom speed aur distance par depend</td></tr>
<tr><td>Load balancing</td><td>Low entropy se ECMP ko dikkat; spraying ke liye reorder-tolerant NICs chahiye</td></tr>
<tr><td>Facility</td><td>Power aur cooling aksar network se pehle scale limit karte hain</td></tr>
<tr><td>Sovereignty</td><td>Prompts aur logs bhi data hain; compute ko data ke paas le jao</td></tr>
<tr><td>AIOps</td><td>Pehle advisory; closed loop sirf guardrails ke saath</td></tr></table>

<div class="warn"><p><b>Galat answer ka post-mortem.</b> Ek mock practical mein candidate ne InfiniBand sirf isliye chuna ki woh "faster" hai aur stated team skills aur multi-vendor requirement ignore kiye. Questioning mein defence toot gaya. Choice ko hamesha stated requirements aur constraints se jodo, aur batao kab yeh depend karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Apna favourite design ratta mat maaro. Is domain ka har answer trade-off hai: batao kya optimise karta hai, kya sacrifice karta hai, aur kya aapka mind badal dega.</p></div>

<div class="scn"><h4>Ek page ka defence</h4><p>Cedar Analytics ke liye strong answer ek page mein aata hai: dedicated rail-optimised back-end fabric jisme ECN first aur PFC safety net; front-end aur storage alag, moderate oversubscription ke saath; power ke hisaab se size kiya staged pod plan; training aur logs sovereign data center mein; advisory AIOps. Reviewer ne maan liya kyunki har choice ek requirement aur ek constraint se judi thi.</p><p><b>Lesson:</b> structure volume se behtar hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao AI fabric zero se kaise design karoge."</p><p>Strong answer: pehle workload aur stakeholders; requirements aur constraints; alag networks; topology aur oversubscription; transport aur congestion control; load balancing; facility limits; data placement; operations. Risks aur migration par khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Products se nahi, workload, requirements aur constraints se shuru karo.</li><li>Back-end: non-blocking, lossless-aware, congestion-controlled aur telemetry-rich.</li><li>Facility aur data-law constraints ideal network ko override kar sakte hain.</li><li>Hamesha options, trade-offs, choice aur pushback ka jawab present karo.</li><li>Saaf bolo jab answer depend karta hai, aur kis par.</li></ul></div>
`.replace(`@@DIA@@`,r([`Kisi bhi AI platform ke paanch design questions`,`Traffic`,`Topology`,`Congestion`,`Facility`,`Placement`,`Training ya inference? Kaun sa network?`,`Rails, tiers, oversubscription, pods?`,`ECN, PFC, load balancing, telemetry?`,`Power, cooling, optics, reach?`,`Data, models aur logs kahan rahenge?`,`Order mein poocho`,`Paanchon sawal order mein hal karo; har answer agle ko narrow karta hai aur defensible design ka structure deta hai.`]))}};export{i as default};