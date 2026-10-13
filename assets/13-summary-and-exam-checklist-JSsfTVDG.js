var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist for AI Infrastructure`,hi:`AI Infrastructure ka summary aur exam checklist`},body:{en:`
<p>AI Infrastructure is the largest domain of the exam at 40 percent, so every chapter in this module is worth revising. Use this page as your last read before the quiz and again the evening before the exam. It gives the module on one page, a say-it-aloud checklist that points to chapters 1 to 12, and the traps that cost marks.</p>
<h3>The module on one page</h3>
<table class="cmp"><tr><th>Topic</th><th>The one idea to keep</th></tr>
<tr><td>Sizing GPU hardware</td><td>Weights memory sets the GPU count; also check storage rate and interconnect. DGX H100-class: 8 GPUs, 640 GB, about 10 kW.</td></tr>
<tr><td>Scale-up and scale-out</td><td>NVLink/NVSwitch inside a server, network between servers. A scalable unit of 32 DGX systems is about 326.4 kW; racks of 1, 2, 4 systems are 10.2, 20.4, 40.8 kW.</td></tr>
<tr><td>Power</td><td>Planning ranges: enterprise rack 7-12 kW, H100-class rack about 40-50 kW, NVL72-class about 120-140 kW. Redundant feeds, plan to 80 percent.</td></tr>
<tr><td>Cooling</td><td>PUE = total facility power / IT power. Air about 1.5, liquid about 1.15 (illustrative). Liquid is beneficial around 40-60 kW per rack and required about 80 kW and above.</td></tr>
<tr><td>Facility</td><td>Floor loading, aisles, cabling, fire protection, security and delivery path.</td></tr>
<tr><td>On-prem, cloud, hybrid</td><td>Capex versus opex; the break-even is a utilisation level.</td></tr>
<tr><td>Cluster components</td><td>Compute fabric, storage fabric, management/OOB network, head nodes.</td></tr>
<tr><td>Storage</td><td>Throughput and checkpoints matter; NVMe, parallel file systems, object storage.</td></tr>
<tr><td>Networking</td><td>Needs: bandwidth, low latency, lossless, non-blocking 1:1, spine-leaf. Vocabulary: RDMA, RoCE, InfiniBand, VXLAN, BGP, GPUDirect RDMA, OOB.</td></tr>
<tr><td>Fabric options</td><td>NVLink, InfiniBand/Quantum with SHARP, Spectrum-X, plain Ethernet.</td></tr>
<tr><td>DPUs and DOCA</td><td>BlueField offloads infrastructure work and isolates it; DOCA is its SDK; SuperNIC is for AI traffic.</td></tr></table>
<h3>Say-it-aloud checklist</h3>
<p>If you cannot say a line in one or two sentences without looking, re-read the chapter in brackets.</p>
<ul><li>I can size GPU count from model weights memory and name the storage and interconnect checks. (Chapter 1)</li><li>I can explain scale-up versus scale-out and quote the 32-system unit and rack power figures. (Chapter 2)</li><li>I can give rack power ranges and apply 80 percent headroom. (Chapter 3)</li><li>I can calculate PUE and say when liquid cooling is beneficial or required. (Chapter 4)</li><li>I can list facility checks beyond power and cooling. (Chapter 5)</li><li>I can compare on-prem, cloud and hybrid using break-even utilisation. (Chapter 6)</li><li>I can name the four cluster components and what each does. (Chapter 7)</li><li>I can explain why storage throughput and checkpoints matter and pick a storage type. (Chapter 8)</li><li>I can state the network requirements for AI. (Chapter 9)</li><li>I can define RDMA, RoCE, VXLAN, BGP, GPUDirect RDMA and OOB. (Chapter 10)</li><li>I can compare NVLink, InfiniBand, Spectrum-X and Ethernet. (Chapter 11)</li><li>I can state the role of a DPU and the meaning of DOCA. (Chapter 12)</li></ul>
<h3>Traps that cost marks</h3>
<table class="cmp"><tr><th>If the question says</th><th>The likely answer</th></tr>
<tr><td>GPU-to-GPU inside one server</td><td>NVLink/NVSwitch (scale-up), not the data-center network</td></tr>
<tr><td>kW versus kWh</td><td>Rack and breaker limits are kW; the bill is kWh</td></tr>
<tr><td>lower PUE</td><td>Better efficiency; 1.0 would mean zero overhead</td></tr>
<tr><td>rack above about 80 kW</td><td>Liquid cooling is required</td></tr>
<tr><td>no packet drops for RDMA traffic</td><td>Lossless fabric (RoCE with careful tuning, or InfiniBand)</td></tr>
<tr><td>non-blocking</td><td>1:1 oversubscription</td></tr>
<tr><td>in-network reduction in collectives</td><td>SHARP on InfiniBand</td></tr>
<tr><td>offload networking, storage and security from the CPU</td><td>DPU (BlueField), programmed with DOCA</td></tr></table>
<div class="eg"><p><b>Worked recap (illustrative numbers).</b> Design a small cluster for a 70-billion-parameter model. Size: in FP16 (2 bytes each) weights need 70 × 2 = 140 GB. Training needs several times that; assume about 4 times, 560 GB, which is close to the 640 GB of one DGX, so choose 4 DGX systems (32 GPUs) for headroom and speed. Power: 4 systems × 10.2 kW = 40.8 kW; place 2 racks of 2 systems at 20.4 kW each, and a feed of at least 20.4 / 0.8 = 25.5 kW per rack. Cooling: 20.4 kW per rack is well below the liquid range, so air cooling works; at PUE 1.5 the facility draws 40.8 × 1.5 = 61.2 kW. Fabric: a non-blocking 1:1 spine-leaf compute fabric (InfiniBand or Spectrum-X) plus a separate storage fabric and an OOB management network. Storage: parallel file system on NVMe for fast data and checkpoints. DPU: BlueField on the storage and tenant side to offload and isolate infrastructure traffic.</p></div>
<div class="exam"><p><b>Last-day advice.</b> Questions mix chapters: a sizing question can end in a power or cooling answer. Always do the arithmetic in order (memory, GPU count, power, cooling, network), and match each product to its job, not to the name you recognise first.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Keep the one-page table in your head; every question is a variation on it.</li><li>Size by memory, then power, then cooling, then fabric and storage.</li><li>Quote ranges as planning ranges and take final figures from vendor specifications.</li><li>Scale-up is NVLink; scale-out is the network; DPUs offload infrastructure work.</li><li>Use the checklist, then take the quiz and re-read only the chapters where you missed a line.</li></ul></div>
`,hi:`
<p>AI Infrastructure exam ka sabse bada domain hai, 40 percent, isliye is module ka har chapter revise karne layak hai. Is page ko quiz se pehle apni aakhri padhai aur exam se ek raat pehle phir se padhne ke liye use karo. Yeh ek page par module deta hai, ek bol kar batane wali checklist jo chapters 1 se 12 ki taraf ishara karti hai, aur woh traps jo marks gawate hain.</p>
<h3>Ek page par module</h3>
<table class="cmp"><tr><th>Topic</th><th>Ek idea jo yaad rakhna hai</th></tr>
<tr><td>Sizing GPU hardware</td><td>Weights memory se GPU count tay hota hai; storage rate aur interconnect bhi check karo. DGX H100-class: 8 GPUs, 640 GB, lagbhag 10 kW.</td></tr>
<tr><td>Scale-up aur scale-out</td><td>Server ke andar NVLink/NVSwitch, servers ke beech network. 32 DGX systems ki scalable unit lagbhag 326.4 kW; 1, 2, 4 systems ke racks 10.2, 20.4, 40.8 kW.</td></tr>
<tr><td>Power</td><td>Planning ranges: enterprise rack 7-12 kW, H100-class rack lagbhag 40-50 kW, NVL72-class lagbhag 120-140 kW. Redundant feeds, 80 percent par plan.</td></tr>
<tr><td>Cooling</td><td>PUE = total facility power / IT power. Air lagbhag 1.5, liquid lagbhag 1.15 (illustrative). Liquid lagbhag 40-60 kW per rack par beneficial aur lagbhag 80 kW aur upar required.</td></tr>
<tr><td>Facility</td><td>Floor loading, aisles, cabling, fire protection, security aur delivery path.</td></tr>
<tr><td>On-prem, cloud, hybrid</td><td>Capex versus opex; break-even ek utilisation level hai.</td></tr>
<tr><td>Cluster components</td><td>Compute fabric, storage fabric, management/OOB network, head nodes.</td></tr>
<tr><td>Storage</td><td>Throughput aur checkpoints zaroori; NVMe, parallel file systems, object storage.</td></tr>
<tr><td>Networking</td><td>Zaroorat: bandwidth, low latency, lossless, non-blocking 1:1, spine-leaf. Vocabulary: RDMA, RoCE, InfiniBand, VXLAN, BGP, GPUDirect RDMA, OOB.</td></tr>
<tr><td>Fabric options</td><td>NVLink, SHARP ke saath InfiniBand/Quantum, Spectrum-X, plain Ethernet.</td></tr>
<tr><td>DPUs aur DOCA</td><td>BlueField infrastructure kaam offload aur isolate karta hai; DOCA uska SDK hai; SuperNIC AI traffic ke liye hai.</td></tr></table>
<h3>Bol kar batane wali checklist</h3>
<p>Agar aap koi line bina dekhe ek-do vaakyon mein nahi bol paate, to bracket wala chapter dobara padho.</p>
<ul><li>Main model weights memory se GPU count size kar sakta hoon aur storage aur interconnect checks bata sakta hoon. (Chapter 1)</li><li>Main scale-up versus scale-out samjha sakta hoon aur 32-system unit aur rack power figures bata sakta hoon. (Chapter 2)</li><li>Main rack power ranges de sakta hoon aur 80 percent headroom laga sakta hoon. (Chapter 3)</li><li>Main PUE calculate kar sakta hoon aur bata sakta hoon ki liquid cooling kab beneficial ya required hai. (Chapter 4)</li><li>Main power aur cooling ke alawa facility checks ginwa sakta hoon. (Chapter 5)</li><li>Main on-prem, cloud aur hybrid ko break-even utilisation se compare kar sakta hoon. (Chapter 6)</li><li>Main chaar cluster components aur har ek ka kaam bata sakta hoon. (Chapter 7)</li><li>Main samjha sakta hoon ki storage throughput aur checkpoints kyun matter karte hain aur storage type chun sakta hoon. (Chapter 8)</li><li>Main AI ke network requirements bata sakta hoon. (Chapter 9)</li><li>Main RDMA, RoCE, VXLAN, BGP, GPUDirect RDMA aur OOB define kar sakta hoon. (Chapter 10)</li><li>Main NVLink, InfiniBand, Spectrum-X aur Ethernet compare kar sakta hoon. (Chapter 11)</li><li>Main DPU ka role aur DOCA ka matlab bata sakta hoon. (Chapter 12)</li></ul>
<h3>Traps jo marks gawate hain</h3>
<table class="cmp"><tr><th>Agar sawal kehta hai</th><th>Sambhavit jawab</th></tr>
<tr><td>ek server ke andar GPU-to-GPU</td><td>NVLink/NVSwitch (scale-up), data-center network nahi</td></tr>
<tr><td>kW versus kWh</td><td>Rack aur breaker limits kW hain; bill kWh</td></tr>
<tr><td>kam PUE</td><td>Behtar efficiency; 1.0 ka matlab zero overhead hoga</td></tr>
<tr><td>rack lagbhag 80 kW se upar</td><td>Liquid cooling required hai</td></tr>
<tr><td>RDMA traffic mein koi packet drop nahi</td><td>Lossless fabric (careful tuning ke saath RoCE, ya InfiniBand)</td></tr>
<tr><td>non-blocking</td><td>1:1 oversubscription</td></tr>
<tr><td>collectives mein in-network reduction</td><td>InfiniBand par SHARP</td></tr>
<tr><td>CPU se networking, storage aur security offload karo</td><td>DPU (BlueField), DOCA se programmed</td></tr></table>
<div class="eg"><p><b>Worked recap (illustrative numbers).</b> 70-billion-parameter model ke liye ek chhota cluster design karo. Size: FP16 (har ek 2 bytes) mein weights ko 70 × 2 = 140 GB chahiye. Training ko iska kai guna chahiye; maan lo lagbhag 4 guna, 560 GB, jo ek DGX ke 640 GB ke kareeb hai, isliye headroom aur speed ke liye 4 DGX systems (32 GPUs) chuno. Power: 4 systems × 10.2 kW = 40.8 kW; 2 systems ke 2 racks lagao, har ek 20.4 kW, aur har rack ka feed kam se kam 20.4 / 0.8 = 25.5 kW. Cooling: 20.4 kW per rack liquid range se bahut neeche hai, isliye air cooling chalti hai; PUE 1.5 par facility 40.8 × 1.5 = 61.2 kW kheenchti hai. Fabric: non-blocking 1:1 spine-leaf compute fabric (InfiniBand ya Spectrum-X), saath mein alag storage fabric aur OOB management network. Storage: fast data aur checkpoints ke liye NVMe par parallel file system. DPU: storage aur tenant side par BlueField, infrastructure traffic offload aur isolate karne ke liye.</p></div>
<div class="exam"><p><b>Aakhri din ki salah.</b> Sawal chapters ko mix karte hain: ek sizing ka sawal power ya cooling ke jawab par khatam ho sakta hai. Arithmetic hamesha kram se karo (memory, GPU count, power, cooling, network), aur har product ko uske kaam se match karo, us naam se nahi jo aap pehle pehchante ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ek-page table dimag mein rakho; har sawal uska ek variation hai.</li><li>Pehle memory se size karo, phir power, phir cooling, phir fabric aur storage.</li><li>Ranges ko planning ranges ki tarah bolo aur final figures vendor specifications se lo.</li><li>Scale-up NVLink hai; scale-out network hai; DPUs infrastructure kaam offload karte hain.</li><li>Checklist use karo, phir quiz do aur sirf wahi chapters dobara padho jahan line miss hui.</li></ul></div>
`}};export{e as default};