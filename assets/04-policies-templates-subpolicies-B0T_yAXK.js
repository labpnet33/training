var e={id:`policies-templates-subpolicies`,h:{en:`Policies, templates and sub-policies`,hi:`Policies, templates aur sub-policies`},body:{en:`
<p>Think of a school rule book. The principal writes the general rules that apply to every class: uniform, attendance, no phones. Each class teacher adds the rules for their own room. For the science lab there is a separate page of safety rules, and the teacher says "for lab work, see page 12". A firewall policy has the same three levels: a <b>template</b> with the rules everyone inherits, the <b>policy</b> itself with the branch's own rules, and a <b>sub-policy</b> that handles one topic on a separate page.</p>

<h3>The policy: an ordered list of rules</h3>
<p>A <b>policy</b> is a named list of Access rules, read from top to bottom. The first rule that matches the connection decides. Each rule has the fields from chapter 1 (source, destination, service, action) plus options such as logging. Disabled rules are skipped. If no rule matches, the connection is discarded. The most useful actions are:</p>
<ul>
<li><b>Allow:</b> let the connection through.</li>
<li><b>Discard:</b> drop silently. The sender just times out.</li>
<li><b>Refuse:</b> drop and send a reset or an unreachable message back.</li>
<li><b>Continue:</b> set defaults (such as the log level) for the rules below, and keep matching.</li>
<li><b>Jump:</b> go to a sub-policy.</li>
</ul>

<h3>Templates: rules every policy inherits</h3>
<p>A <b>template</b> is a policy that other policies are built on. The rules of the template appear at the <b>top</b> of the policy that uses it, in a locked section. The branch administrator can add rules below but cannot edit the inherited ones. Rule numbers show the origin: inherited rules appear as <code>T1</code>, <code>T2</code> and so on, and the policy's own rules as <code>1</code>, <code>2</code>, <code>3</code>. The head office uses templates to enforce rules that must exist on every branch, such as "always allow management contact" or "always block known bad destinations". Because template rules come first, they win over anything the branch writes below.</p>

<h3>Sub-policies: a rule that jumps to a list</h3>
<p>A <b>sub-policy</b> is a short rule list used for one topic, for example "everything for the DMZ". In the main policy you write one rule with the action <b>Jump</b>, whose match is the traffic you want to hand over (for example destination net-dmz). When a connection matches the Jump rule, matching continues inside the sub-policy. If one of its rules matches, that rule decides. If none matches, the engine returns to the calling policy and continues with the rule after the Jump. Sub-policy rules are numbered with the parent, such as <code>3.1</code>, <code>3.2</code> for the sub-policy entered from rule 3. In the simulator, sub-policies cannot contain NAT rules; NAT is covered in a later module.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Template, policy and sub-policy">
<rect x="20" y="10" width="260" height="240" rx="10" fill="#e2e8f0"/><text x="150" y="32" text-anchor="middle" class="svg-ink" font-size="14">Policy: Pune-Policy</text>
<rect x="35" y="44" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="150" y="69" text-anchor="middle" class="svg-ink" font-size="12">T1  inherited from template</text>
<rect x="35" y="92" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="150" y="117" text-anchor="middle" class="svg-ink" font-size="12">T2  inherited from template</text>
<rect x="35" y="140" width="230" height="40" rx="6" fill="#bae6fd"/><text x="150" y="165" text-anchor="middle" class="svg-ink" font-size="12">1  Staff to internet: Allow</text>
<rect x="35" y="188" width="230" height="40" rx="6" fill="#fde68a"/><text x="150" y="213" text-anchor="middle" class="svg-ink" font-size="12">2  dst net-dmz: Jump</text>
<rect x="360" y="60" width="260" height="130" rx="10" fill="#bbf7d0"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="14">Sub-policy: DMZ</text>
<text x="490" y="116" text-anchor="middle" class="svg-ink" font-size="12">2.1  staff to srv-web tcp-8080 Allow</text>
<text x="490" y="140" text-anchor="middle" class="svg-ink" font-size="12">2.2  anything else: no match</text>
<text x="490" y="172" text-anchor="middle" class="svg-muted" font-size="12">no match: return to Pune-Policy</text>
<line x1="265" y1="208" x2="360" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="238" text-anchor="middle" class="svg-accent" font-size="12">Jump</text>
</svg><p class="cap">Template rules come first, then the policy's own rules. A Jump rule hands matching traffic to a sub-policy.</p></div>

<h3>The lab Initial Policy</h3>
<p>A new engine needs some policy to start with, otherwise it could not talk to the SMC at all. The lab provides the <b>Initial Policy</b>. It has one purpose: it allows only the management contact between the engine and the SMC (the predefined service <code>SMC contact</code>). Everything else falls into the implicit discard. After you install it, the SMC and the engine can talk, but STAFF-PC cannot reach the internet. That is correct and safe. Later you install a real branch policy that also keeps the management contact rule.</p>

<pre class="out">Policy: Initial Policy   (installed on NK-PUNE-FW)
 #   Source     Destination   Service        Action
 1   srv-smc    engine        SMC contact    Allow
 1   engine     srv-smc       SMC contact    Allow
 -   (implicit)  any          any            Discard</pre>
<p>The layout above is a teaching sketch of the idea. The console shows its own columns.</p>

<div class="eg"><p><b>Worked example.</b> A draft Pune policy has three rules: (1) net-staff to any on HTTPS, Allow; (2) net-staff to srv-web on tcp-8080, Allow; (3) any to any, Discard with log level Stored. A packet from 10.1.1.10 to 172.16.20.20 on TCP 8080 first meets rule 1 (service HTTPS: no), then rule 2 (yes). Allow. A packet from 10.1.1.10 to 172.16.20.20 on TCP 22 skips both, hits rule 3 and is discarded and logged. If you moved rule 3 to the top, everything would be discarded, including the first two cases.</p></div>

<h3>Order, shadowing and "allow any"</h3>
<p>Because the first match wins, order matters. A broad rule above a narrow rule <b>shadows</b> it: the narrow rule can never be reached. The SMC reports a shadowed rule as a <b>warning</b>, not an error. A rule that allows any source to any destination on any service also produces a warning because it is almost never what you want. Warnings do not block an install. You, not the tool, decide whether it is a mistake.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing a very broad Allow at the top. Forgetting that the policy must keep management contact allowed after the Initial Policy is replaced. Editing a template and not realising every policy built on it changes at its next install. Expecting a sub-policy to decide when no rule inside matches; it returns instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template rules are numbered T and sit on top; they win over the policy's own rules. A Jump with no match inside the sub-policy returns to the caller. Continue does not stop matching; Allow, Discard and Refuse do.</p></div>

<div class="scn"><h4>The rule nobody could reach</h4><p>A Pune administrator added "Allow net-staff to srv-web tcp-8080" at position 6 but users still got timeouts. The Logs page showed discards at rule 4, a general "net-staff to net-dmz: Discard" that a colleague had added earlier. The SMC had shown a warning about a shadowed rule at install, but it was ignored. The fix was to move the specific Allow above the general Discard and install again.</p><p><b>Lesson:</b> read install warnings. A shadowed rule is a warning, but it usually means a ticket is coming.</p></div>

<div class="iv"><p class="q">"What is the difference between a template and a sub-policy?"</p><p>Strong answer: a template is inherited: its rules are placed at the top of every policy that uses it, and local administrators cannot change them. A sub-policy is entered: a Jump rule sends matching traffic into it, and if nothing matches inside, matching returns to the calling policy. Templates give central control, sub-policies give structure. Add that both appear in rule numbering, T1 and 3.1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy is an ordered list of rules; first match wins; no match means discard.</li>
<li>A template adds inherited rules at the top (T1, T2) that local admins cannot edit.</li>
<li>A sub-policy is entered with Jump; no match inside returns to the calling policy.</li>
<li>The lab Initial Policy allows only SMC contact between engine and SMC.</li>
<li>Shadowed rules and allow any-any-any are warnings, not errors.</li>
</ul></div>
`,hi:`
<p>School ki rule book socho. Principal woh general rules likhta hai jo har class par lagu hote hain: uniform, attendance, phone nahi. Har class teacher apne room ke rules jodta hai. Science lab ke liye safety rules ka alag page hai, aur teacher kehta hai "lab work ke liye page 12 dekho". Firewall policy mein bhi yahi teen levels hain: <b>template</b> jisme woh rules hain jo sab inherit karte hain, <b>policy</b> khud jisme branch ke apne rules hain, aur <b>sub-policy</b> jo ek topic ko alag page par handle karti hai.</p>

<h3>Policy: rules ki ordered list</h3>
<p><b>Policy</b> Access rules ki naam wali list hai, upar se neeche padhi jaati hai. Jo pehla rule match kare wahi decide karta hai. Har rule mein chapter 1 ke fields hain (source, destination, service, action) aur logging jaise options. Disabled rules skip hote hain. Koi rule match na kare to connection discard hota hai. Sabse kaam ke actions:</p>
<ul>
<li><b>Allow:</b> connection ko jaane do.</li>
<li><b>Discard:</b> chupchap drop. Sender bas timeout hota hai.</li>
<li><b>Refuse:</b> drop karo aur reset ya unreachable message wapas bhejo.</li>
<li><b>Continue:</b> neeche ke rules ke liye defaults (jaise log level) set karo, aur matching jaari rakho.</li>
<li><b>Jump:</b> sub-policy mein jao.</li>
</ul>

<h3>Templates: jo rules har policy inherit karti hai</h3>
<p><b>Template</b> woh policy hai jiske upar doosri policies banti hain. Template ke rules use karne wali policy ke <b>top</b> par ek locked section mein dikhte hain. Branch administrator neeche rules jod sakta hai lekin inherited rules edit nahi kar sakta. Rule numbers origin dikhate hain: inherited rules <code>T1</code>, <code>T2</code> aise dikhte hain, aur policy ke apne rules <code>1</code>, <code>2</code>, <code>3</code>. Head office templates se woh rules enforce karta hai jo har branch par hone zaroori hain, jaise "management contact hamesha allow" ya "known bad destinations hamesha block". Template rules pehle aate hain, isliye branch ne neeche jo likha usse upar jeet jaate hain.</p>

<h3>Sub-policies: rule jo list mein jump karta hai</h3>
<p><b>Sub-policy</b> ek topic ke liye chhoti rule list hai, jaise "DMZ ka sab kuch". Main policy mein aap ek rule likhte ho jiska action <b>Jump</b> hai, aur match woh traffic jo handover karna hai (jaise destination net-dmz). Connection Jump rule se match kare to matching sub-policy ke andar jaari rehti hai. Andar ka koi rule match kare to wahi decide karta hai. Koi match na kare to engine calling policy mein wapas aata hai aur Jump ke baad ke rule se chalta hai. Sub-policy rules parent ke saath number hote hain, jaise <code>3.1</code>, <code>3.2</code> rule 3 se enter hui sub-policy ke liye. Simulator mein sub-policies mein NAT rules nahi ho sakte; NAT aage ke module mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Template, policy aur sub-policy">
<rect x="20" y="10" width="260" height="240" rx="10" fill="#e2e8f0"/><text x="150" y="32" text-anchor="middle" class="svg-ink" font-size="14">Policy: Pune-Policy</text>
<rect x="35" y="44" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="150" y="69" text-anchor="middle" class="svg-ink" font-size="12">T1  template se inherited</text>
<rect x="35" y="92" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="150" y="117" text-anchor="middle" class="svg-ink" font-size="12">T2  template se inherited</text>
<rect x="35" y="140" width="230" height="40" rx="6" fill="#bae6fd"/><text x="150" y="165" text-anchor="middle" class="svg-ink" font-size="12">1  Staff to internet: Allow</text>
<rect x="35" y="188" width="230" height="40" rx="6" fill="#fde68a"/><text x="150" y="213" text-anchor="middle" class="svg-ink" font-size="12">2  dst net-dmz: Jump</text>
<rect x="360" y="60" width="260" height="130" rx="10" fill="#bbf7d0"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="14">Sub-policy: DMZ</text>
<text x="490" y="116" text-anchor="middle" class="svg-ink" font-size="12">2.1  staff to srv-web tcp-8080 Allow</text>
<text x="490" y="140" text-anchor="middle" class="svg-ink" font-size="12">2.2  baaki sab: no match</text>
<text x="490" y="172" text-anchor="middle" class="svg-muted" font-size="12">no match: Pune-Policy mein wapas</text>
<line x1="265" y1="208" x2="360" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="238" text-anchor="middle" class="svg-accent" font-size="12">Jump</text>
</svg><p class="cap">Template rules pehle, phir policy ke apne rules. Jump rule matching traffic ko sub-policy ko deta hai.</p></div>

<h3>Lab ki Initial Policy</h3>
<p>Naye engine ko shuru karne ke liye koi policy chahiye, warna woh SMC se baat hi nahi kar payega. Lab <b>Initial Policy</b> deta hai. Iska ek hi kaam hai: yeh sirf engine aur SMC ke beech management contact allow karti hai (predefined service <code>SMC contact</code>). Baaki sab implicit discard mein jaata hai. Ise install karne ke baad SMC aur engine baat kar sakte hain, lekin STAFF-PC internet reach nahi kar sakta. Yeh sahi aur safe hai. Baad mein aap asli branch policy install karte ho jo management contact rule bhi rakhti hai.</p>

<pre class="out">Policy: Initial Policy   (installed on NK-PUNE-FW)
 #   Source     Destination   Service        Action
 1   srv-smc    engine        SMC contact    Allow
 1   engine     srv-smc       SMC contact    Allow
 -   (implicit)  any          any            Discard</pre>
<p>Upar ka layout idea samjhane ke liye teaching sketch hai. Console apne columns dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Draft Pune policy mein teen rules hain: (1) net-staff se any, HTTPS, Allow; (2) net-staff se srv-web, tcp-8080, Allow; (3) any se any, Discard, log level Stored. 10.1.1.10 se 172.16.20.20 par TCP 8080 ka packet pehle rule 1 se milta hai (service HTTPS: nahi), phir rule 2 (haan). Allow. 10.1.1.10 se 172.16.20.20 par TCP 22 dono skip karta hai, rule 3 par aata hai aur discard aur log hota hai. Agar rule 3 ko top par le jao to sab discard ho jayega, pehle do cases bhi.</p></div>

<h3>Order, shadowing aur "allow any"</h3>
<p>First match wins hone ki wajah se order matter karta hai. Narrow rule ke upar broad rule usse <b>shadow</b> kar deta hai: narrow rule kabhi reach hi nahi hota. SMC shadowed rule ko <b>warning</b> ki tarah report karta hai, error nahi. Jo rule kisi bhi source se kisi bhi destination par kisi bhi service ko allow kare, woh bhi warning deta hai kyunki aap shayad hi yeh chahte ho. Warnings install block nahi karti. Galti hai ya nahi, yeh aap decide karte ho, tool nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> Top par bahut broad Allow likhna. Yeh bhoolna ki Initial Policy replace hone ke baad bhi policy mein management contact allow rehna chahiye. Template edit karna aur na samajhna ki us par bani har policy ka next install par badal jata hai. Sub-policy se decision expect karna jab andar koi rule match nahi karta; woh wapas return karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template rules T se number hote hain aur top par rehte hain; woh policy ke apne rules se jeet jaate hain. Sub-policy ke andar match na ho to Jump calling policy mein return karta hai. Continue matching rokta nahi; Allow, Discard aur Refuse rokte hain.</p></div>

<div class="scn"><h4>Woh rule jo kabhi reach hi nahi hua</h4><p>Pune ke ek administrator ne "Allow net-staff to srv-web tcp-8080" position 6 par joda lekin users ko ab bhi timeout aa raha tha. Logs page par rule 4 par discards dikhe, jo ek general "net-staff to net-dmz: Discard" tha jo colleague ne pehle joda tha. SMC ne install par shadowed rule ki warning dikhayi thi lekin ignore hui. Fix: specific Allow ko general Discard ke upar le jao aur dobara install karo.</p><p><b>Lesson:</b> install warnings padho. Shadowed rule warning hai, lekin aam taur par iska matlab ticket aane wala hai.</p></div>

<div class="iv"><p class="q">"Template aur sub-policy mein kya difference hai?"</p><p>Strong answer: template inherit hota hai: uske rules har us policy ke top par placed hote hain jo use use karti hai, aur local administrators unhe badal nahi sakte. Sub-policy enter hoti hai: Jump rule matching traffic ko andar bhejta hai, aur andar kuch match na ho to matching calling policy mein wapas aati hai. Template central control deta hai, sub-policy structure deti hai. Bolo ki dono rule numbering mein dikhte hain, T1 aur 3.1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy rules ki ordered list hai; first match wins; no match matlab discard.</li>
<li>Template top par inherited rules (T1, T2) deta hai jo local admins edit nahi kar sakte.</li>
<li>Sub-policy Jump se enter hoti hai; andar no match ho to calling policy mein return.</li>
<li>Lab ki Initial Policy sirf engine aur SMC ke beech SMC contact allow karti hai.</li>
<li>Shadowed rules aur allow any-any-any warnings hain, errors nahi.</li>
</ul></div>
`}};export{e as default};