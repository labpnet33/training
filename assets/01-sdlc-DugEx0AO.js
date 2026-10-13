var e={id:`sdlc`,h:{en:`Why software design matters, and the SDLC phases`,hi:`Software design kyun zaroori hai, aur SDLC ke phases`},body:{en:`
<p><b>What you will learn in this module.</b> Automation is software. Every script that pushes a VLAN to fifty switches, every pipeline that tests a config before it goes live, every tool that calls a controller API was <i>designed</i>, <i>built</i>, <i>tested</i> and <i>shipped</i> by someone. The Cisco 200-901 exam (domain 1, software development and design, plus a few items in domains 4 and 5) checks that you know how that process works and which ideas make code easier to live with. By the end of these chapters you will be able to: name the phases of the software development life cycle (SDLC); compare Waterfall, Agile and Lean; organise code into functions, classes and modules; explain MVC and the Observer pattern; list the advantages of version control; write and run a Python unit test; read a unified diff; and describe what a good code review looks like.</p>
<p><b>Prerequisites.</b> You do not need to have written a program. If you have seen a Python <code>print()</code> and a <code>def</code> in the Python modules of this academy, you are ready. We teach classes and objects from zero in chapter 4. The Git commands themselves (clone, commit, branch, merge) live in the Git module, so here we only explain <i>why</i> version control matters.</p>

<h3>Start with an analogy: building a house</h3>
<p>Nobody builds a house by buying bricks and starting. First you ask the family what they need (three bedrooms, a parking spot). An architect draws plans. Builders construct. An inspector checks the wiring and the plumbing. The family moves in. Later the roof leaks and someone repairs it. Software follows the same story. Skipping a step is possible, but the cost shows up later: a house without plans has doors that open into walls, and a script without requirements solves the wrong problem.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The SDLC cycle">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Requirements</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Design</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Implementation</text>
<rect x="440" y="150" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="180" text-anchor="middle" class="svg-ink" font-size="13">4 Testing</text>
<rect x="230" y="150" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">5 Deployment</text>
<rect x="20" y="150" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="180" text-anchor="middle" class="svg-ink" font-size="13">6 Maintenance</text>
<line x1="200" y1="45" x2="228" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="438" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="70" x2="530" y2="148" stroke="#64748b" stroke-width="2"/><line x1="440" y1="175" x2="412" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="175" x2="202" y2="175" stroke="#64748b" stroke-width="2"/><line x1="110" y1="148" x2="110" y2="72" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Maintenance feeds new requirements back to the start</text>
</svg><p class="cap">The SDLC is a loop, not a straight line: what you learn in production becomes the next set of requirements.</p></div>

<h3>The phases, one by one</h3>
<dl class="terms">
<dt>Requirements (planning and analysis)</dt><dd>Find out <b>what</b> the software must do and for whom. A requirement is a testable sentence: "Reject any VLAN id outside 1-4094 before it reaches a switch."</dd>
<dt>Design</dt><dd>Decide <b>how</b> it will be built: the pieces, how they talk, which data they hold, which patterns to use. Output: diagrams and short documents, not code.</dd>
<dt>Implementation (coding)</dt><dd>Write the code, in small steps, saved in version control.</dd>
<dt>Testing</dt><dd>Check that the code meets the requirements and does not break old features. Unit tests, integration tests, and a human trying it out.</dd>
<dt>Deployment (release)</dt><dd>Put the new version where people use it: a server, a package, a pipeline that pushes config.</dd>
<dt>Maintenance</dt><dd>Fix bugs, add features, keep up with changes such as a new software release on the devices. This is usually the longest and most expensive phase.</dd>
</dl>
<div class="warn"><p><b>Common mistake.</b> Textbooks and vendors list the phases with slightly different names and counts (some say "analysis", "build", "release", "operate"). Do not memorise one exact list of words. Understand the flow: decide what, decide how, build, check, ship, keep it running. On the exam, pick the phase that matches the <i>activity</i> in the question.</p></div>

<h3>A network example through every phase</h3>
<div class="eg"><p><b>Metro Cargo</b> wants a tool that creates VLANs on its switches from a spreadsheet.</p>
<ul>
<li><b>Requirements:</b> accept a list of VLAN ids and names; refuse bad ids; produce the config lines; log what it did.</li>
<li><b>Design:</b> one function checks an id, one builds the lines for a VLAN, one reads the spreadsheet. The tool never pushes to a switch until the checks pass.</li>
<li><b>Implementation:</b> a developer writes <code>is_valid_vlan()</code> and <code>make_vlan_config()</code> in Python and commits them.</li>
<li><b>Testing:</b> unit tests try VLAN 0, 1, 4094, 4095 and the text "ten". You will do exactly this in Lab 1.</li>
<li><b>Deployment:</b> the tool is released to the NOC team as a versioned package.</li>
<li><b>Maintenance:</b> six months later the team asks for VLAN names with spaces. A new requirement starts the loop again.</li>
</ul></div>

<h3>Why this matters for network engineers</h3>
<p>The job is shifting from typing commands to writing the software that types them. A tool that is badly designed fails at 2 a.m. across 200 devices at once, so the cost of a bug is multiplied by the size of the network. Good design and testing are how you keep that multiplication safe. The next chapters give you the vocabulary (SDLC models, patterns, tests) and the habits (version control, review) that professional teams rely on.</p>

<div class="scn"><h4>The tool nobody could change</h4><p>A branch-onboarding script at a retail company grew for three years: no requirements written, no tests, one 900-line file. When the company moved from two VLANs per branch to five, the engineer who understood it had left. Every change broke something else, and a Friday rollout locked three branches out of their switches. The team paused the project, wrote down the requirements, split the script into small functions and added tests before touching new features.</p><p><b>Lesson:</b> skipping design and testing does not save time, it borrows it with interest.</p></div>

<div class="iv"><p class="q">"What is the SDLC and why do teams use it?"</p><p>It is the repeatable process software goes through: requirements, design, implementation, testing, deployment and maintenance. Teams use it so everyone agrees what is being built, defects are found early when they are cheap to fix, and releases are predictable. Add that it is a loop: maintenance generates new requirements. Mention that Agile, Waterfall and Lean are different ways of running these same phases.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The SDLC phases are requirements, design, implementation, testing, deployment and maintenance, and they repeat.</li>
<li>Requirements say what, design says how; neither is code.</li>
<li>Maintenance is usually the longest and costliest phase.</li>
<li>Bugs in automation scale with the network, so design and testing matter more, not less.</li>
<li>Match exam questions to the activity described, not to one memorised list of names.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Automation software hai. Har script jo pachaas switches par VLAN push karta hai, har pipeline jo config live hone se pehle test karti hai, har tool jo controller API call karta hai, kisi ne use <i>design</i>, <i>build</i>, <i>test</i> aur <i>ship</i> kiya hai. Cisco 200-901 exam (domain 1, software development and design, aur domain 4 aur 5 ke kuch items) check karta hai ki aapko yeh process kaise chalta hai aur kaunse ideas code ko sambhalna aasaan banate hain. In chapters ke end tak aap yeh kar paoge: software development life cycle (SDLC) ke phases ke naam batana; Waterfall, Agile aur Lean ki tulna karna; code ko functions, classes aur modules mein organise karna; MVC aur Observer pattern samjhana; version control ke advantages ginana; Python unit test likhna aur chalana; unified diff padhna; aur ek achha code review kaisa dikhta hai yeh batana.</p>
<p><b>Prerequisites.</b> Aapne program likha ho yeh zaroori nahi. Agar aapne is academy ke Python modules mein Python ka <code>print()</code> aur <code>def</code> dekha hai, to aap ready ho. Classes aur objects hum chapter 4 mein zero se sikhate hain. Git ke commands (clone, commit, branch, merge) Git module mein hain, isliye yahan hum sirf samjhate hain ki version control <i>kyun</i> zaroori hai.</p>

<h3>Analogy se shuru karo: ghar banana</h3>
<p>Koi bhi eent kharid kar seedha ghar nahi banata. Pehle parivar se poochte ho unhe kya chahiye (teen bedroom, parking). Architect plan banata hai. Builder construction karte hain. Inspector wiring aur plumbing check karta hai. Parivar andar aata hai. Baad mein chhat leak hoti hai aur koi repair karta hai. Software ki kahani bhi yahi hai. Koi step chhodna possible hai, par cost baad mein dikhti hai: bina plan ke ghar ke darwaze deewar mein khulte hain, aur bina requirements ke script galat problem solve karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SDLC cycle">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Requirements</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Design</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Implementation</text>
<rect x="440" y="150" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="180" text-anchor="middle" class="svg-ink" font-size="13">4 Testing</text>
<rect x="230" y="150" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">5 Deployment</text>
<rect x="20" y="150" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="180" text-anchor="middle" class="svg-ink" font-size="13">6 Maintenance</text>
<line x1="200" y1="45" x2="228" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="438" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="70" x2="530" y2="148" stroke="#64748b" stroke-width="2"/><line x1="440" y1="175" x2="412" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="175" x2="202" y2="175" stroke="#64748b" stroke-width="2"/><line x1="110" y1="148" x2="110" y2="72" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Maintenance naye requirements wapas start par bhejta hai</text>
</svg><p class="cap">SDLC ek loop hai, seedhi line nahi: production mein jo seekhte ho wahi agle requirements ban jaate hain.</p></div>

<h3>Phases, ek ek karke</h3>
<dl class="terms">
<dt>Requirements (planning aur analysis)</dt><dd>Pata lagao software ko <b>kya</b> karna hai aur kiske liye. Requirement ek testable sentence hota hai: "1-4094 se bahar ka koi bhi VLAN id switch tak pahunchne se pehle reject karo."</dd>
<dt>Design</dt><dd>Tay karo ki yeh <b>kaise</b> banega: pieces, woh kaise baat karte hain, kaun sa data rakhte hain, kaunse patterns use honge. Output: diagrams aur chhote documents, code nahi.</dd>
<dt>Implementation (coding)</dt><dd>Code likho, chhote steps mein, version control mein save karke.</dd>
<dt>Testing</dt><dd>Check karo ki code requirements poori karta hai aur purani features nahi todta. Unit tests, integration tests, aur insaan khud use karke dekhta hai.</dd>
<dt>Deployment (release)</dt><dd>Naya version wahan rakho jahan log use karte hain: server, package, ya pipeline jo config push karti hai.</dd>
<dt>Maintenance</dt><dd>Bugs fix karo, features jodo, devices ke naye software release jaise badlaavon ke saath chalo. Yeh aam taur par sabse lamba aur mehnga phase hota hai.</dd>
</dl>
<div class="warn"><p><b>Aam galti.</b> Kitabein aur vendors phases ko thode alag naam aur ginti ke saath likhte hain (kuch "analysis", "build", "release", "operate" kehte hain). Ek exact list ke shabd ratta mat maaro. Flow samjho: kya banana hai tay karo, kaise tay karo, banao, check karo, ship karo, chalate raho. Exam mein jo <i>activity</i> question mein hai uske hisaab se phase chuno.</p></div>

<h3>Network ka example, har phase se</h3>
<div class="eg"><p><b>Metro Cargo</b> ko ek tool chahiye jo spreadsheet se switches par VLANs banaye.</p>
<ul>
<li><b>Requirements:</b> VLAN ids aur names ki list lo; bad ids refuse karo; config lines banao; kya kiya woh log karo.</li>
<li><b>Design:</b> ek function id check kare, ek VLAN ki lines banaye, ek spreadsheet padhe. Checks pass hone tak tool switch par kuch push nahi karta.</li>
<li><b>Implementation:</b> developer Python mein <code>is_valid_vlan()</code> aur <code>make_vlan_config()</code> likhta hai aur commit karta hai.</li>
<li><b>Testing:</b> unit tests VLAN 0, 1, 4094, 4095 aur text "ten" try karte hain. Lab 1 mein aap yahi karoge.</li>
<li><b>Deployment:</b> tool NOC team ko versioned package ke roop mein release hota hai.</li>
<li><b>Maintenance:</b> chhe mahine baad team spaces wale VLAN names maangti hai. Naya requirement loop dobara shuru karta hai.</li>
</ul></div>

<h3>Network engineers ke liye yeh kyun matter karta hai</h3>
<p>Kaam ab commands type karne se un commands ko type karne wala software likhne ki taraf ja raha hai. Kharab design wala tool raat 2 baje ek saath 200 devices par fail hota hai, isliye bug ki keemat network ke size se multiply ho jaati hai. Achha design aur testing us multiplication ko safe rakhte hain. Agle chapters aapko vocabulary (SDLC models, patterns, tests) aur habits (version control, review) dete hain jin par professional teams bharosa karti hain.</p>

<div class="scn"><h4>Woh tool jise koi badal nahi sakta tha</h4><p>Ek retail company ka branch-onboarding script teen saal mein bada hota gaya: koi requirements likhe nahi, koi test nahi, ek 900 line ki file. Jab company ne har branch par do VLANs se paanch VLANs kiye, jo engineer use samajhta tha woh ja chuka tha. Har change kuch aur tod deta tha, aur Friday ke rollout ne teen branches ko unke switches se bahar kar diya. Team ne project roka, requirements likhe, script ko chhote functions mein todha aur nayi features se pehle tests jode.</p><p><b>Lesson:</b> design aur testing chhodna time bachata nahi, byaaj ke saath udhaar leta hai.</p></div>

<div class="iv"><p class="q">"SDLC kya hai aur teams use kyun karti hain?"</p><p>Yeh woh repeatable process hai jisse software guzarta hai: requirements, design, implementation, testing, deployment aur maintenance. Teams use isliye karti hain ki sabko pata ho kya ban raha hai, defects jaldi milein jab fix karna sasta hai, aur releases predictable hon. Jodo ki yeh loop hai: maintenance naye requirements paida karta hai. Bolo ki Agile, Waterfall aur Lean in hi phases ko chalane ke alag tareeke hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDLC ke phases requirements, design, implementation, testing, deployment aur maintenance hain, aur yeh repeat hote hain.</li>
<li>Requirements batate hain kya, design batata hai kaise; dono code nahi hain.</li>
<li>Maintenance aam taur par sabse lamba aur sabse mehnga phase hai.</li>
<li>Automation ke bugs network ke saath scale hote hain, isliye design aur testing aur zyada zaroori hain.</li>
<li>Exam questions ko batayi gayi activity se match karo, ek yaad ki hui list ke naamon se nahi.</li>
</ul></div>
`}};export{e as default};