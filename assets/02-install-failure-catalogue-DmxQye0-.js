var e={id:`install-failure-catalogue`,h:{en:`A catalogue of install failures and what each message means`,hi:`Install failures ka catalogue aur har message ka matlab`},body:{en:`
<p>Think of a courier who must deliver a parcel to a flat. He checks, in order: is the building address right, does the flat exist, is the lift working, will the resident open the door, and is the parcel complete. He stops at the first problem and tells you which one. A FortiManager install behaves like this courier. It runs a fixed list of checks before it sends a single line of configuration, and the first failed check is the message you read. Knowing the list turns a scary red message into a one-line diagnosis.</p>

<h3>What an install does first</h3>
<p>An <b>install</b> sends the intended configuration (device settings from templates, then a policy package) from FortiManager to a FortiGate. Before sending, FortiManager prepares the change and validates it. If any check fails, nothing is sent: the FortiGate and its revision history stay unchanged. The simulator offers installs as <code>execute fmgui install-package &lt;adom&gt; &lt;pkg&gt; &lt;device&gt;</code> and <code>install-preview</code>; in the real product these are GUI or API actions.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Install checks in order">
<rect x="10" y="20" width="112" height="50" rx="6" fill="#ddd6fe"/><text x="66" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 Scope</text><text x="66" y="58" text-anchor="middle" class="svg-muted" font-size="12">ADOM, device</text>
<rect x="136" y="20" width="112" height="50" rx="6" fill="#ddd6fe"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 Package</text><text x="192" y="58" text-anchor="middle" class="svg-muted" font-size="12">exists, target</text>
<rect x="262" y="20" width="112" height="50" rx="6" fill="#bae6fd"/><text x="318" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Tunnel</text><text x="318" y="58" text-anchor="middle" class="svg-muted" font-size="12">FGFM up</text>
<rect x="388" y="20" width="112" height="50" rx="6" fill="#bae6fd"/><text x="444" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 Push</text><text x="444" y="58" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
<rect x="514" y="20" width="116" height="50" rx="6" fill="#fde68a"/><text x="572" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 Content</text><text x="572" y="58" text-anchor="middle" class="svg-muted" font-size="12">objects, mapping</text>
<line x1="122" y1="45" x2="136" y2="45" stroke="#64748b" stroke-width="2"/><line x1="248" y1="45" x2="262" y2="45" stroke="#64748b" stroke-width="2"/><line x1="374" y1="45" x2="388" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="514" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="10" y="110" class="svg-muted" font-size="12">Any failed check stops the install. Nothing is sent and the revision history is unchanged.</text>
<text x="10" y="134" class="svg-accent" font-size="12">Last stage: the FortiGate may still reject a CLI line, and the install is rolled back.</text>
</svg><p class="cap">The order in which the simulator validates an install.</p></div>

<h3>The catalogue</h3>
<table class="cmp"><tr><th>Message (shortened)</th><th>Meaning</th><th>Fix</th></tr>
<tr><td>ADOM '...' does not exist</td><td>Typing error or ADOM never created.</td><td>Check the ADOM name; create it.</td></tr>
<tr><td>device '...' is not managed in ADOM '...'</td><td>Device is in another ADOM or not authorized.</td><td>Authorize it or use the right ADOM.</td></tr>
<tr><td>policy package '...' does not exist in ADOM '...'</td><td>Wrong package name or ADOM.</td><td>List the packages.</td></tr>
<tr><td>device '...' is not an installation target of package '...'</td><td>The package does not list this device.</td><td>Add the device as installation target.</td></tr>
<tr><td>the FGFM tunnel to ... is down (device status: connection down)</td><td>FortiManager cannot talk to the device.</td><td>Back to the onboarding workflow.</td></tr>
<tr><td>... does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</td><td>The FortiGate refuses pushed configuration.</td><td>Set allow-push-configuration enable on the FortiGate.</td></tr>
<tr><td>address object '...' not found in the ADOM</td><td>A policy uses an object that does not exist.</td><td>Create the object in the ADOM.</td></tr>
<tr><td>normalized interface '...' has no mapping for device ...</td><td>No dynamic-mapping row for this device.</td><td>Add the mapping to the real port.</td></tr>
<tr><td>interface '...' does not exist on ...</td><td>Plain interface name used, device lacks it.</td><td>Use a normalized interface or the right port.</td></tr></table>
<p>Several content errors can appear together, joined by semicolons. Fix them all, then run the install-preview again.</p>

<div class="eg"><p><b>Worked example.</b> The real output below comes from MDU-FGT in the troubleshooting lab. Same command, three different messages, each after one fix.</p></div>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP MDU-FGT
Install failed: device 'MDU-FGT' is not an installation target of package 'Branch-PP'.

Install failed: <span class="hl">MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</span>.

Install failed: normalized interface 'LAN' has no mapping for device MDU-FGT.</pre>

<h3>Where version mismatch belongs</h3>
<p>People expect a version mismatch to appear at install. In the simulator it appears earlier, at authorize or add-device, because the device cannot enter an ADOM of a different version at all. If your device is already in an ADOM, the version is not your install problem.</p>

<h3>The last gate: the device rejects a line</h3>
<p>If all checks pass but the FortiGate itself refuses a CLI line, the result is a different shape: <code>Install failed on MDU-FGT: ...</code> followed by the statement that the install was rolled back and the revision history is unchanged. Read the first error line, fix its cause and install again.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading only "Install failed" and guessing. Fixing the mapping while allow-push-configuration is still disabled, so the message simply changes. Adding a device to the right package in the wrong ADOM. Treating install-preview as a test of the FortiGate: preview runs the same validation but sends nothing.</p></div>

<div class="exam"><p><b>Exam traps.</b> allow-push-configuration is a setting on the FortiGate, not in FortiManager. A policy package must list the device as installation target. A normalized interface needs a mapping per device (or default mapping with an equal interface name). A failed install leaves the revision history unchanged.</p></div>

<div class="scn"><h4>The package that worked on Trichy and failed on Madurai</h4><p>A package installed cleanly on TRY-FGT but failed on MDU-FGT with a mapping message. The engineer first suspected a bug in FortiManager. Reading the message again, it named the normalized interface LAN and the device MDU-FGT. Someone had created the mapping only for Trichy. He added the mapping to port2 for MDU-FGT, ran the preview, saw the policy lines and installed.</p><p><b>Lesson:</b> the message names the object and the device. Read both words before you touch anything.</p></div>

<div class="iv"><p class="q">"An install fails. How do you find out why?"</p><p>Read the first error: it names the failed check. Walk the order: scope, package and target, tunnel, push permission, objects and mapping. Run install-preview after each fix, because it validates without changing the device. Mention that a failed install changes nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An install validates in a fixed order and stops at the first failed stage.</li>
<li>Nothing is sent and no revision is created when validation fails.</li>
<li>Push disabled is a FortiGate setting; mapping and objects live in the ADOM.</li>
<li>Version mismatch is refused earlier, at authorize or add-device.</li>
<li>Use install-preview to re-validate after each fix.</li>
</ul></div>
`,hi:`
<p>Socho ek courier ko flat mein parcel dena hai. Wo order mein check karta hai: building ka address sahi hai, flat exist karta hai, lift chal rahi hai, resident darwaza kholega, aur parcel poora hai. Wo pehli problem par ruk kar batata hai ki kaun si hai. FortiManager install bhi isi courier jaisa kaam karta hai. Wo configuration ki ek bhi line bhejne se pehle checks ki fixed list chalata hai, aur pehla failed check wahi message hai jo aap padhte ho. List pata ho to darawna red message ek line ka diagnosis ban jata hai.</p>

<h3>Install pehle kya karta hai</h3>
<p><b>Install</b> intended configuration (templates se device settings, phir policy package) FortiManager se FortiGate ko bhejta hai. Bhejne se pehle FortiManager change tayyar karta hai aur validate karta hai. Koi check fail ho to kuch nahi bheja jata: FortiGate aur uski revision history waisi hi rehti hai. Simulator installs ko <code>execute fmgui install-package &lt;adom&gt; &lt;pkg&gt; &lt;device&gt;</code> aur <code>install-preview</code> ki tarah deta hai; real product mein ye GUI ya API actions hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Install checks in order">
<rect x="10" y="20" width="112" height="50" rx="6" fill="#ddd6fe"/><text x="66" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 Scope</text><text x="66" y="58" text-anchor="middle" class="svg-muted" font-size="12">ADOM, device</text>
<rect x="136" y="20" width="112" height="50" rx="6" fill="#ddd6fe"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 Package</text><text x="192" y="58" text-anchor="middle" class="svg-muted" font-size="12">exists, target</text>
<rect x="262" y="20" width="112" height="50" rx="6" fill="#bae6fd"/><text x="318" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Tunnel</text><text x="318" y="58" text-anchor="middle" class="svg-muted" font-size="12">FGFM up</text>
<rect x="388" y="20" width="112" height="50" rx="6" fill="#bae6fd"/><text x="444" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 Push</text><text x="444" y="58" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
<rect x="514" y="20" width="116" height="50" rx="6" fill="#fde68a"/><text x="572" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 Content</text><text x="572" y="58" text-anchor="middle" class="svg-muted" font-size="12">objects, mapping</text>
<line x1="122" y1="45" x2="136" y2="45" stroke="#64748b" stroke-width="2"/><line x1="248" y1="45" x2="262" y2="45" stroke="#64748b" stroke-width="2"/><line x1="374" y1="45" x2="388" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="514" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="10" y="110" class="svg-muted" font-size="12">Koi bhi check fail ho to install ruk jata hai. Kuch nahi bheja jata, revision history same.</text>
<text x="10" y="134" class="svg-accent" font-size="12">Last stage: FortiGate ek CLI line reject kare to install roll back hota hai.</text>
</svg><p class="cap">Simulator install ko jis order mein validate karta hai.</p></div>

<h3>Catalogue</h3>
<table class="cmp"><tr><th>Message (shortened)</th><th>Matlab</th><th>Fix</th></tr>
<tr><td>ADOM '...' does not exist</td><td>Typing error ya ADOM kabhi bana hi nahi.</td><td>ADOM ka naam check karo; banao.</td></tr>
<tr><td>device '...' is not managed in ADOM '...'</td><td>Device doosre ADOM mein hai ya authorize nahi hua.</td><td>Authorize karo ya sahi ADOM use karo.</td></tr>
<tr><td>policy package '...' does not exist in ADOM '...'</td><td>Package ya ADOM ka naam galat.</td><td>Packages ki list dekho.</td></tr>
<tr><td>device '...' is not an installation target of package '...'</td><td>Package is device ko list nahi karta.</td><td>Device ko installation target banao.</td></tr>
<tr><td>the FGFM tunnel to ... is down (device status: connection down)</td><td>FortiManager device se baat nahi kar pa raha.</td><td>Onboarding workflow par wapas jao.</td></tr>
<tr><td>... does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</td><td>FortiGate pushed configuration refuse karta hai.</td><td>FortiGate par allow-push-configuration enable karo.</td></tr>
<tr><td>address object '...' not found in the ADOM</td><td>Policy aisa object use karti hai jo exist nahi karta.</td><td>ADOM mein object banao.</td></tr>
<tr><td>normalized interface '...' has no mapping for device ...</td><td>Is device ke liye dynamic-mapping row nahi hai.</td><td>Real port ka mapping jodo.</td></tr>
<tr><td>interface '...' does not exist on ...</td><td>Plain interface name use hua, device par wo nahi hai.</td><td>Normalized interface ya sahi port use karo.</td></tr></table>
<p>Kai content errors ek saath semicolon se jude aa sakte hain. Sab fix karo, phir install-preview dobara chalao.</p>

<div class="eg"><p><b>Worked example.</b> Neeche ka real output troubleshooting lab ke MDU-FGT se hai. Same command, teen alag messages, har ek ek fix ke baad.</p></div>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP MDU-FGT
Install failed: device 'MDU-FGT' is not an installation target of package 'Branch-PP'.

Install failed: <span class="hl">MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</span>.

Install failed: normalized interface 'LAN' has no mapping for device MDU-FGT.</pre>

<h3>Version mismatch kahan aata hai</h3>
<p>Log expect karte hain ki version mismatch install par dikhe. Simulator mein ye pehle, authorize ya add-device par dikhta hai, kyunki device alag version ke ADOM mein enter hi nahi kar sakta. Device pehle se ADOM mein hai to version aapki install problem nahi hai.</p>

<h3>Aakhri gate: device ek line reject karta hai</h3>
<p>Saare checks pass ho jayein par FortiGate khud ek CLI line refuse kare, to result alag shape ka hota hai: <code>Install failed on MDU-FGT: ...</code> aur uske baad statement ki install roll back ho gaya aur revision history unchanged hai. Pehli error line padho, uski wajah fix karo aur dobara install karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Sirf "Install failed" padhkar guess karna. allow-push-configuration disabled hone par mapping fix karna, to message sirf badal jata hai. Sahi package mein device jodna par galat ADOM mein. Install-preview ko FortiGate ka test samajhna: preview wahi validation chalata hai par kuch bhejta nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> allow-push-configuration FortiGate ki setting hai, FortiManager ki nahi. Policy package ko device installation target ke roop mein list karna padta hai. Normalized interface ko har device ke liye mapping chahiye (ya default mapping jab interface name barabar ho). Failed install revision history ko unchanged chhodta hai.</p></div>

<div class="scn"><h4>Package jo Trichy par chala aur Madurai par fail hua</h4><p>Ek package TRY-FGT par saaf install ho gaya par MDU-FGT par mapping message ke saath fail hua. Engineer ne pehle FortiManager ke bug ka shak kiya. Message dobara padha to usme normalized interface LAN aur device MDU-FGT ka naam tha. Kisi ne mapping sirf Trichy ke liye banayi thi. Usne MDU-FGT ke liye port2 ka mapping jodha, preview chalaya, policy lines dekhin aur install kiya.</p><p><b>Lesson:</b> message object aur device dono ka naam batata hai. Kuch chhune se pehle dono shabd padho.</p></div>

<div class="iv"><p class="q">"Install fail ho gaya. Aap wajah kaise dhoondhoge?"</p><p>Pehli error padho: wo failed check ka naam batati hai. Order chalo: scope, package aur target, tunnel, push permission, objects aur mapping. Har fix ke baad install-preview chalao, kyunki wo device badle bina validate karta hai. Kehna ki failed install kuch nahi badalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install fixed order mein validate karta hai aur pehle failed stage par ruk jata hai.</li>
<li>Validation fail ho to kuch nahi bheja jata aur koi revision nahi banta.</li>
<li>Push disabled FortiGate ki setting hai; mapping aur objects ADOM mein rehte hain.</li>
<li>Version mismatch pehle, authorize ya add-device par refuse hota hai.</li>
<li>Har fix ke baad re-validate karne ke liye install-preview use karo.</li>
</ul></div>
`}};export{e as default};