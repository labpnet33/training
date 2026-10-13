var e={id:`summary-exam`,h:{en:`Summary, exam blueprint and checklist`,hi:`Summary, exam blueprint aur checklist`},body:{en:`
<p>This last chapter collects what you learned, shows where it sits in the Security Service Edge (SSE) Engineer exam, and gives you a checklist to test yourself.</p>

<h3>The exam blueprint</h3>
<p>The certification is named <b>Palo Alto Networks Certified Security Service Edge (SSE) Engineer</b>. The official datasheet lists five domains with weights:</p>
<table class="cmp"><tr><th>Domain</th><th>Weight</th><th>Topics listed</th></tr>
<tr><td>1. Prisma Access Planning and Deployment</td><td>22%</td><td>Architecture and components, routing, service infrastructure, mobile users, remote networks, private application access, identity authentication</td></tr>
<tr><td>2. Prisma Access Services</td><td>22%</td><td>Advanced features, data security, profiles and policies, user-based policies</td></tr>
<tr><td>3. Prisma Browser</td><td>22%</td><td>Deploy; policies and profiles</td></tr>
<tr><td>4. Prisma Access Administration and Operation</td><td>16%</td><td>Manage with Panorama, manage with SCM, Strata Logging Service, security posture</td></tr>
<tr><td>5. Prisma Access Troubleshooting</td><td>18%</td><td>Monitor and troubleshoot connectivity, troubleshoot traffic enforcement</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Domain weights">
<rect x="20" y="30" width="220" height="24" rx="4" fill="#bae6fd"/><text x="250" y="47" class="svg-ink" font-size="12">Planning and Deployment 22%</text>
<rect x="20" y="62" width="220" height="24" rx="4" fill="#bbf7d0"/><text x="250" y="79" class="svg-ink" font-size="12">Services 22%</text>
<rect x="20" y="94" width="220" height="24" rx="4" fill="#e2e8f0"/><text x="250" y="111" class="svg-ink" font-size="12">Prisma Browser 22% (not in this track)</text>
<rect x="20" y="126" width="160" height="24" rx="4" fill="#fde68a"/><text x="190" y="143" class="svg-ink" font-size="12">Administration 16%</text>
<rect x="330" y="30" width="190" height="24" rx="4" fill="#fed7aa"/><text x="530" y="47" class="svg-ink" font-size="12">Troubleshooting 18%</text>
</svg><p class="cap">Prisma Browser carries 22% of the exam but is outside this simulator track.</p></div>
<p>The datasheet is dated March 2026. The text read does not give the number of questions, the duration or the passing score, so check the current official exam guide before you book. The exam is offered in English, with a 30-minute accommodation for candidates in non-English-speaking countries.</p>
<div class="note"><p><b>Where this module sits.</b> This module supports Domain 1 (architecture, service infrastructure) and Domain 4 (Panorama versus SCM, commit and push). The other modules in the track cover mobile users, remote networks, service connections, policy and operations.</p></div>
<div class="note"><p><b>Honest reminder.</b> The cloud console in this academy is a teaching model. It uses the real vocabulary and order of work but simplifies screens, and some topics (licence activation, Strata Logging Service, Explicit Proxy, HIP redistribution) are concept only. Practise on the real product or an official trial before the exam.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain SSE and why backhaul is a problem.</li>
<li>I can name the three connection types and give a lab example of each.</li>
<li>I can explain location versus compute location, and what a termination node and service endpoint address are.</li>
<li>I can choose an infrastructure subnet that does not overlap, and say the default AS.</li>
<li>I can state the licence limits and the aggregate bandwidth rules.</li>
<li>I can choose Panorama or SCM and justify it.</li>
<li>I can list the onboarding order and the menu paths for both tools.</li>
<li>I can explain why Commit to Panorama alone changes nothing, and how to fix it.</li>
<li>I can describe trust, untrust and zone mapping.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SSE</dt><dd>Security Service Edge, security functions delivered from the cloud.</dd>
<dt>Tenant / TSG</dt><dd>Your isolated instance, held in a Tenant Service Group with a TSG ID.</dd>
<dt>Compute location</dt><dd>Group of at least two nearby locations; bandwidth is allocated here.</dd>
<dt>Infrastructure subnet</dt><dd>Your block used to build the Prisma Access backbone; must not overlap.</dd>
<dt>Infrastructure BGP AS</dt><dd>Private AS of the backbone, default 65534.</dd>
<dt>Config Status</dt><dd>In sync or Out of sync between your management tool and the cloud.</dd>
<dt>Trusted Zones</dt><dd>The mapped zones treated as trust for internal resources.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Default infrastructure AS</td><td>65534 (private)</td></tr>
<tr><td>Infrastructure subnet sizing</td><td>/24 under 50 sites and 2,500 users; /23 under 100 sites and 5,000 users</td></tr>
<tr><td>Avoid in subnet</td><td>169.254.0.0/16 and 100.64.0.0/10</td></tr>
<tr><td>Minimum bandwidth per compute location</td><td>50 Mbps</td></tr>
<tr><td>Termination node capacity</td><td>Up to 1,000 Mbps</td></tr>
<tr><td>Service connections</td><td>5 in base licences, up to 200 with the add-on</td></tr>
<tr><td>Local licence locations</td><td>At most five combined</td></tr>
<tr><td>Panorama templates</td><td>Mobile_User_Template, Remote_Network_Template, Service_Conn_Template</td></tr>
<tr><td>Zones created</td><td>Trust, Untrust, Clientless VPN</td></tr>
<tr><td>Migration direction</td><td>Panorama to SCM only, irreversible</td></tr>
</table>

<div class="eg"><p><b>Worked example: a self-test.</b> A tenant has HQ 10.10.0.0/24, branches in 10.20.0.0/24, a pool 10.200.0.0/23 and infrastructure subnet 10.255.0.0/24 with AS 65534. A branch is added using 10.255.0.0/24. Which rule is broken? Overlap with the infrastructure subnet. What do you change? Renumber the branch, not the infrastructure.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not memorise the exam name only; the objectives include mobile users, remote networks, private application access and troubleshooting. This module is the base for all of them.</p></div>

<div class="scn"><h4>The interview in one minute</h4><p>A candidate was asked to explain Prisma Access in one minute. She drew three boxes (mobile users, remote networks, service connections), named the infrastructure subnet and AS, stated that policy changes need a push, and said which tool she would choose for a Panorama shop. The interviewer moved straight to troubleshooting questions.</p><p><b>Lesson:</b> a clear vocabulary lets you move to higher-level discussions fast.</p></div>

<div class="iv"><p class="q">"Tell me what you would check before onboarding the first user."</p><p>Strong answer: licence active, management path ready, infrastructure subnet and AS chosen without overlap, service connection present, zone mapping planned, and a push completed with Config Status In sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exam: five domains, with Prisma Access Planning and Deployment at 22%.</li>
<li>Know the three connection types, location versus compute location, and licence limits.</li>
<li>Know both management paths and their menus.</li>
<li>Commit to Panorama saves; Commit and Push or Push Config applies.</li>
<li>The simulator is a teaching model; confirm details on the real product.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter aapne jo seekha use collect karta hai, dikhata hai ki woh Security Service Edge (SSE) Engineer exam mein kahan baithta hai, aur khud ko test karne ke liye checklist deta hai.</p>

<h3>Exam blueprint</h3>
<p>Certification ka naam <b>Palo Alto Networks Certified Security Service Edge (SSE) Engineer</b> hai. Official datasheet weights ke saath paanch domains list karti hai:</p>
<table class="cmp"><tr><th>Domain</th><th>Weight</th><th>Listed topics</th></tr>
<tr><td>1. Prisma Access Planning and Deployment</td><td>22%</td><td>Architecture aur components, routing, service infrastructure, mobile users, remote networks, private application access, identity authentication</td></tr>
<tr><td>2. Prisma Access Services</td><td>22%</td><td>Advanced features, data security, profiles aur policies, user-based policies</td></tr>
<tr><td>3. Prisma Browser</td><td>22%</td><td>Deploy; policies aur profiles</td></tr>
<tr><td>4. Prisma Access Administration and Operation</td><td>16%</td><td>Panorama se manage, SCM se manage, Strata Logging Service, security posture</td></tr>
<tr><td>5. Prisma Access Troubleshooting</td><td>18%</td><td>Connectivity monitor aur troubleshoot, traffic enforcement troubleshoot</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Domain weights">
<rect x="20" y="30" width="220" height="24" rx="4" fill="#bae6fd"/><text x="250" y="47" class="svg-ink" font-size="12">Planning and Deployment 22%</text>
<rect x="20" y="62" width="220" height="24" rx="4" fill="#bbf7d0"/><text x="250" y="79" class="svg-ink" font-size="12">Services 22%</text>
<rect x="20" y="94" width="220" height="24" rx="4" fill="#e2e8f0"/><text x="250" y="111" class="svg-ink" font-size="12">Prisma Browser 22% (is track mein nahi)</text>
<rect x="20" y="126" width="160" height="24" rx="4" fill="#fde68a"/><text x="190" y="143" class="svg-ink" font-size="12">Administration 16%</text>
<rect x="330" y="30" width="190" height="24" rx="4" fill="#fed7aa"/><text x="530" y="47" class="svg-ink" font-size="12">Troubleshooting 18%</text>
</svg><p class="cap">Prisma Browser exam ka 22% hai lekin is simulator track ke bahar hai.</p></div>
<p>Datasheet March 2026 ki hai. Jo text padha gaya usme questions ki sankhya, duration ya passing score nahi diya, isliye book karne se pehle current official exam guide check karo. Exam English mein hota hai, aur non-English-speaking countries ke candidates ke liye 30 minute ka accommodation hai.</p>
<div class="note"><p><b>Yeh module kahan baithta hai.</b> Yeh module Domain 1 (architecture, service infrastructure) aur Domain 4 (Panorama versus SCM, commit aur push) ko support karta hai. Track ke baaki modules mobile users, remote networks, service connections, policy aur operations cover karte hain.</p></div>
<div class="note"><p><b>Imaandaar reminder.</b> Is academy ka cloud console ek teaching model hai. Yeh asli vocabulary aur kaam ka order use karta hai lekin screens simplify karta hai, aur kuch topics (licence activation, Strata Logging Service, Explicit Proxy, HIP redistribution) sirf concept hain. Exam se pehle asli product ya official trial par practise karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main SSE aur backhaul ki problem explain kar sakta hoon.</li>
<li>Main teen connection types ke naam aur har ka lab example bata sakta hoon.</li>
<li>Main location versus compute location, aur termination node aur service endpoint address explain kar sakta hoon.</li>
<li>Main overlap-free infrastructure subnet chun sakta hoon, aur default AS bata sakta hoon.</li>
<li>Main licence limits aur aggregate bandwidth rules bata sakta hoon.</li>
<li>Main Panorama ya SCM chun kar justify kar sakta hoon.</li>
<li>Main onboarding order aur dono tools ke menu paths list kar sakta hoon.</li>
<li>Main explain kar sakta hoon ki sirf Commit to Panorama kuch kyun nahi badalta, aur fix kaise hota hai.</li>
<li>Main trust, untrust aur zone mapping describe kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SSE</dt><dd>Security Service Edge, cloud se deliver hone wale security functions.</dd>
<dt>Tenant / TSG</dt><dd>Aapka isolated instance, jo TSG ID ke saath Tenant Service Group mein hota hai.</dd>
<dt>Compute location</dt><dd>Kam se kam do paas ke locations ka group; bandwidth yahin allocate hoti hai.</dd>
<dt>Infrastructure subnet</dt><dd>Aapka block jo Prisma Access backbone banane mein use hota hai; overlap nahi hona chahiye.</dd>
<dt>Infrastructure BGP AS</dt><dd>Backbone ka private AS, default 65534.</dd>
<dt>Config Status</dt><dd>Aapke management tool aur cloud ke beech In sync ya Out of sync.</dd>
<dt>Trusted Zones</dt><dd>Mapped zones jinhe internal resources ke liye trust maana jaata hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Default infrastructure AS</td><td>65534 (private)</td></tr>
<tr><td>Infrastructure subnet sizing</td><td>50 sites aur 2,500 users se kam par /24; 100 sites aur 5,000 users se kam par /23</td></tr>
<tr><td>Subnet mein avoid</td><td>169.254.0.0/16 aur 100.64.0.0/10</td></tr>
<tr><td>Compute location ki minimum bandwidth</td><td>50 Mbps</td></tr>
<tr><td>Termination node capacity</td><td>1,000 Mbps tak</td></tr>
<tr><td>Service connections</td><td>Base licence mein 5, add-on ke saath 200 tak</td></tr>
<tr><td>Local licence locations</td><td>Maximum paanch combined</td></tr>
<tr><td>Panorama templates</td><td>Mobile_User_Template, Remote_Network_Template, Service_Conn_Template</td></tr>
<tr><td>Banne wale zones</td><td>Trust, Untrust, Clientless VPN</td></tr>
<tr><td>Migration direction</td><td>Sirf Panorama se SCM, irreversible</td></tr>
</table>

<div class="eg"><p><b>Worked example: self-test.</b> Tenant mein HQ 10.10.0.0/24, branches 10.20.0.0/24, pool 10.200.0.0/23 aur infrastructure subnet 10.255.0.0/24 AS 65534 ke saath hai. Ek branch 10.255.0.0/24 use karke add hoti hai. Kaunsa rule toota? Infrastructure subnet se overlap. Kya badloge? Branch ko renumber karo, infrastructure ko nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf exam ka naam ratta mat maaro; objectives mein mobile users, remote networks, private application access aur troubleshooting shaamil hain. Yeh module un sabka base hai.</p></div>

<div class="scn"><h4>Ek minute ka interview</h4><p>Ek candidate se ek minute mein Prisma Access explain karne ko kaha gaya. Usne teen boxes banaye (mobile users, remote networks, service connections), infrastructure subnet aur AS ka naam liya, bataya ki policy changes ko push chahiye, aur Panorama shop ke liye kaunsa tool chunegi yeh bhi bataya. Interviewer seedha troubleshooting questions par chala gaya.</p><p><b>Seekh:</b> clear vocabulary aapko higher-level discussion mein jaldi pahunchati hai.</p></div>

<div class="iv"><p class="q">"Pehle user ko onboard karne se pehle kya check karoge?"</p><p>Strong answer: licence active, management path ready, overlap-free infrastructure subnet aur AS chune hue, service connection maujood, zone mapping planned, aur push complete ho kar Config Status In sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exam: paanch domains, Prisma Access Planning and Deployment 22% ke saath.</li>
<li>Teen connection types, location versus compute location, aur licence limits jaano.</li>
<li>Dono management paths aur unke menus jaano.</li>
<li>Commit to Panorama save karta hai; Commit and Push ya Push Config apply karta hai.</li>
<li>Simulator ek teaching model hai; details asli product par confirm karo.</li>
</ul></div>
`}};export{e as default};