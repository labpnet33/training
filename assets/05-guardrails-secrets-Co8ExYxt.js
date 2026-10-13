var e={id:`guardrails-secrets`,h:{en:`Guardrails: allow-lists, limits and keeping secrets out`,hi:`Guardrails: allow-lists, limits aur secrets ko bahar rakhna`},body:{en:`
<p><b>One idea:</b> safe tools are built in <b>layers</b>. If one layer fails, the next still holds. A schema may be bypassed, so the code validates. The code may have a bug, so the account has only read-only rights. Think of a bank vault: a guard, a locked door, a safe and a camera, not one thing.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Allow-list tools, devices to Validation types, patterns to Limits rate, time, size to Least privilege read-only account to Audit every call logged"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Allow-list</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">tools, devices</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Validation</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">types, patterns</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Limits</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">rate, time, size</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Least privilege</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">read-only account</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Audit</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">every call logged</text></svg><p class="cap">Five layers. Any one of them can fail and the others still protect the network.</p></div>
<h3>Layer 1: allow-lists, not block-lists</h3>
<p>A <b>block-list</b> says "everything except these". It is always incomplete, because attackers and mistakes find the thing you forgot. An <b>allow-list</b> says "only these, nothing else". Allow-list the <b>tools</b> (the menu), the <b>devices</b> (the inventory), the <b>command templates</b> and, for roles, which user may use which tool. When a new device appears it is denied until someone adds it on purpose.</p>
<h3>Layer 2 and 3: validation and limits</h3>
<ul><li><b>Validate every argument</b> as in the previous chapter: type, allowed values, pattern, no extra fields. Reject, do not "clean up", suspicious input.</li><li><b>Rate limits</b> per user and per device, so a runaway agent cannot overload a router.</li><li><b>Timeouts</b> on every device session, so a hung command cannot hold a connection open forever.</li><li><b>Output caps</b>: trim long output before it returns to the model. Large outputs cost money, slow the model and increase the chance of leaking something.</li></ul>
<p>A small per-device rate limiter, with fixed times so the output is the same every run:</p>
<pre class="code"><span class="c"># A tiny per-device rate limit: at most 3 calls in any 60-second window.</span>
<span class="c"># Times are passed in (seconds) so this sketch gives the same result every run.</span>
def make_limiter(max_calls=3, window=60):
    calls = {}
    def allow(device, now):
        recent = [t for t in calls.get(device, []) if now - t &lt; window]
        if len(recent) &gt;= max_calls:
            calls[device] = recent
            return False
        recent.append(now)
        calls[device] = recent
        return True
    return allow

allow = make_limiter()
for now in (0, 5, 10, 15, 70):
    print("t =", now, "R1 allowed:", allow("R1", now))
print("t = 15 R2 allowed:", allow("R2", 15))</pre>
<pre class="out">t = 0 R1 allowed: True
t = 5 R1 allowed: True
t = 10 R1 allowed: True
t = 15 R1 allowed: False
t = 70 R1 allowed: True
t = 15 R2 allowed: True</pre>
<p><code>make_limiter</code> returns an inner function <code>allow</code> that remembers the call times in <code>calls</code>. Each call keeps only the times from the last 60 seconds. At t = 0, 5 and 10 the three allowed calls are used up, so the call at t = 15 is refused. At t = 70 the earlier calls have aged out of the window, so R1 is allowed again. R2 has its own count. The limit is per device, which protects each device separately.</p>
<h3>Layer 4: least privilege and secrets</h3>
<ul><li><b>Use a dedicated read-only account</b> on the devices for the server (for example a privilege level or role that can run show commands only). If the code has a bug, the account still cannot change configuration.</li><li><b>No secrets in prompts.</b> A password pasted into a chat becomes part of the conversation, may be stored in logs, and can appear in later answers.</li><li><b>No secrets in tool arguments or tool output.</b> The model should never see a credential, so it cannot repeat one. The server loads credentials from its own environment or a secrets store and uses them only inside the connection step.</li><li><b>Redact output.</b> Some show commands print password hashes, community strings or keys. Remove them before returning anything.</li></ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># Reference code (not run in the simulator): credentials stay on the server side</span>
import os

def device_login():
    user = os.environ["NETOPS_READONLY_USER"]        # injected by the service manager or a secrets store
    secret = os.environ["NETOPS_READONLY_SECRET"]    # never typed into a prompt, never returned by a tool
    return user, secret                              # used only inside the connect step, never logged</pre>
<p>The credential variables are read from the environment, which the service manager or a secrets store fills. The file contains no secret, so it can be reviewed and stored in version control. Next, a redaction step run on sample text that contains made-up placeholders only:</p>
<pre class="code">import re

SAMPLE = """hostname R1
username netops privilege 15 secret 9 EXAMPLE-HASH-NOT-REAL
snmp-server community EXAMPLE-COMMUNITY RO
tacacs-server key EXAMPLE-KEY-NOT-REAL
interface Gi1
 description UPLINK-TO-CORE
 ip address 192.0.2.11 255.255.255.0"""

<span class="c"># Replace the value that follows a sensitive keyword (and an optional encryption-type number).</span>
SENSITIVE = re.compile(r"\\b(secret|password|community|key)\\b(\\s+[0-9]+)?\\s+\\S+", re.IGNORECASE)

def redact(text):
    return SENSITIVE.sub(lambda m: m.group(1) + (m.group(2) or "") + " [REDACTED]", text)

def limit(text, max_chars=200):
    """Cap what goes back to the model."""
    if len(text) &lt;= max_chars:
        return text
    return text[:max_chars] + "\\n[output truncated: " + str(len(text) - max_chars) + " more characters]"

safe = limit(redact(SAMPLE), max_chars=140)
print(safe)</pre>
<pre class="out">hostname R1
username netops privilege 15 secret 9 [REDACTED]
snmp-server community [REDACTED] RO
tacacs-server key [REDACTED]
interface Gi1

[output truncated: 64 more characters]</pre>
<p>The regular expression finds a keyword (secret, password, community, key), an optional number (the encryption type) and the value that follows, and replaces the value with <code>[REDACTED]</code>. <code>re.IGNORECASE</code> makes it ignore capital letters. The hostname, description and address lines pass through unchanged. The <code>limit</code> function then cuts the text at 140 characters and says how much was dropped. <b>Redaction by pattern is a safety net, not a guarantee</b>: unknown formats can slip through, so the read-only account and a careful choice of commands come first.</p>
<div class="warn"><p><b>Common mistake.</b> Putting a password in the system prompt "just for the test". Test prompts get copied into tickets, chats and logs. Use a throwaway lab credential in the environment, and rotate it afterwards.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the layers and the rule "allow-list, not block-list". Secrets belong in the server environment or a secrets store, never in prompts, arguments, outputs or logs. Redaction is defence in depth, not a replacement for least privilege.</p></div>
<div class="scn"><h4>The community string in the answer</h4><p>A user asked an assistant to "summarise the SNMP settings on R1". The first version of the tool returned the whole running configuration, and the model quoted the SNMP community in its answer, which was pasted into a ticket visible to many people. The fix had three parts: the tool now returns only parsed, non-secret fields, a redaction layer runs on any text, and the community was rotated.</p><p><b>Lesson:</b> Return only the fields a question needs, and redact the rest.</p></div>
<div class="iv"><p class="q">"What guardrails would you put around a network MCP server?"</p><p>Allow-lists for tools and devices; strict argument validation in code; per-user and per-device rate limits, timeouts and output caps; a dedicated read-only device account; credentials only in the server environment or secrets store and never in prompts, arguments or output; redaction of sensitive patterns; and full audit logging. I enforce them in server code because prompts are not security controls.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Build in layers: allow-list, validation, limits, least privilege, audit.</li><li>Allow-lists beat block-lists.</li><li>Rate limits, timeouts and output caps protect devices and the model.</li><li>Secrets live in the server environment, never in prompts, arguments, outputs or logs.</li><li>Redaction is a safety net; a read-only account is the foundation.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> safe tools <b>layers</b> mein banaye jaate hain. Ek layer fail ho to agli phir bhi rok leti hai. Schema bypass ho sakta hai, isliye code validate karta hai. Code mein bug ho sakta hai, isliye account ke paas sirf read-only rights hain. Bank vault ki tarah socho: guard, locked door, safe aur camera, ek cheez nahi.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Allow-list tools, devices to Validation types, patterns to Limits rate, time, size to Least privilege read-only account to Audit har call logged"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Allow-list</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">tools, devices</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Validation</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">types, patterns</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Limits</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">rate, time, size</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Least privilege</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">read-only account</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Audit</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">har call logged</text></svg><p class="cap">Paanch layers. Koi bhi ek fail ho sakti hai aur baaki network ko bachati hain.</p></div>
<h3>Layer 1: allow-lists, block-lists nahi</h3>
<p><b>Block-list</b> kehti hai "in ke siwa sab". Woh hamesha adhoori hoti hai, kyunki attackers aur galtiyan wahi cheez dhoondh leti hain jo aap bhool gaye. <b>Allow-list</b> kehti hai "sirf yeh, aur kuch nahi". <b>Tools</b> (menu), <b>devices</b> (inventory), <b>command templates</b> aur roles ke liye, kaun sa user kaunsa tool use kar sakta hai, allow-list karo. Naya device aaye to tab tak deny rehta hai jab tak koi jaan-bujhkar use jod na de.</p>
<h3>Layer 2 aur 3: validation aur limits</h3>
<ul><li>Pichhle chapter ki tarah <b>har argument validate karo</b>: type, allowed values, pattern, koi extra field nahi. Shak wale input ko reject karo, "saaf" mat karo.</li><li>Per user aur per device <b>rate limits</b>, taaki bhaaga hua agent router ko overload na kar sake.</li><li>Har device session par <b>timeouts</b>, taaki atka hua command connection ko hamesha khula na rakh sake.</li><li><b>Output caps</b>: lamba output model ko lautne se pehle trim karo. Bade outputs paise lagate hain, model ko slow karte hain aur kuch leak hone ka chance badhate hain.</li></ul>
<p>Chhota per-device rate limiter, fixed times ke saath taaki output har run mein same ho:</p>
<pre class="code"><span class="c"># A tiny per-device rate limit: at most 3 calls in any 60-second window.</span>
<span class="c"># Times are passed in (seconds) so this sketch gives the same result every run.</span>
def make_limiter(max_calls=3, window=60):
    calls = {}
    def allow(device, now):
        recent = [t for t in calls.get(device, []) if now - t &lt; window]
        if len(recent) &gt;= max_calls:
            calls[device] = recent
            return False
        recent.append(now)
        calls[device] = recent
        return True
    return allow

allow = make_limiter()
for now in (0, 5, 10, 15, 70):
    print("t =", now, "R1 allowed:", allow("R1", now))
print("t = 15 R2 allowed:", allow("R2", 15))</pre>
<pre class="out">t = 0 R1 allowed: True
t = 5 R1 allowed: True
t = 10 R1 allowed: True
t = 15 R1 allowed: False
t = 70 R1 allowed: True
t = 15 R2 allowed: True</pre>
<p><code>make_limiter</code> ek inner function <code>allow</code> lautata hai jo <code>calls</code> mein call times yaad rakhta hai. Har call sirf pichhle 60 seconds ke times rakhti hai. t = 0, 5 aur 10 par teen allowed calls khatam ho jaati hain, isliye t = 15 ki call refuse hoti hai. t = 70 par purani calls window se bahar ho chuki hain, isliye R1 phir allowed hai. R2 ki apni ginti hai. Limit per device hai, jo har device ko alag se bachati hai.</p>
<h3>Layer 4: least privilege aur secrets</h3>
<ul><li>Server ke liye devices par <b>dedicated read-only account</b> use karo (jaise privilege level ya role jo sirf show commands chala sake). Code mein bug ho to bhi account configuration nahi badal sakta.</li><li><b>Prompts mein secrets nahi.</b> Chat mein paste kiya password conversation ka hissa ban jaata hai, logs mein store ho sakta hai, aur baad ke jawabon mein dikh sakta hai.</li><li><b>Tool arguments ya tool output mein secrets nahi.</b> Model ko credential kabhi nahi dikhna chahiye, taaki woh use dohra na sake. Server credentials apne environment ya secrets store se leta hai aur sirf connection step ke andar use karta hai.</li><li><b>Output redact karo.</b> Kuch show commands password hashes, community strings ya keys print karte hain. Kuch bhi lautane se pehle unhe hata do.</li></ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># Reference code (not run in the simulator): credentials stay on the server side</span>
import os

def device_login():
    user = os.environ["NETOPS_READONLY_USER"]        # injected by the service manager or a secrets store
    secret = os.environ["NETOPS_READONLY_SECRET"]    # never typed into a prompt, never returned by a tool
    return user, secret                              # used only inside the connect step, never logged</pre>
<p>Credential variables environment se padhe jaate hain, jise service manager ya secrets store bharta hai. File mein koi secret nahi, isliye woh review ho sakti hai aur version control mein rakhi ja sakti hai. Agla, sample text par redaction step, jisme sirf made-up placeholders hain:</p>
<pre class="code">import re

SAMPLE = """hostname R1
username netops privilege 15 secret 9 EXAMPLE-HASH-NOT-REAL
snmp-server community EXAMPLE-COMMUNITY RO
tacacs-server key EXAMPLE-KEY-NOT-REAL
interface Gi1
 description UPLINK-TO-CORE
 ip address 192.0.2.11 255.255.255.0"""

<span class="c"># Replace the value that follows a sensitive keyword (and an optional encryption-type number).</span>
SENSITIVE = re.compile(r"\\b(secret|password|community|key)\\b(\\s+[0-9]+)?\\s+\\S+", re.IGNORECASE)

def redact(text):
    return SENSITIVE.sub(lambda m: m.group(1) + (m.group(2) or "") + " [REDACTED]", text)

def limit(text, max_chars=200):
    """Cap what goes back to the model."""
    if len(text) &lt;= max_chars:
        return text
    return text[:max_chars] + "\\n[output truncated: " + str(len(text) - max_chars) + " more characters]"

safe = limit(redact(SAMPLE), max_chars=140)
print(safe)</pre>
<pre class="out">hostname R1
username netops privilege 15 secret 9 [REDACTED]
snmp-server community [REDACTED] RO
tacacs-server key [REDACTED]
interface Gi1

[output truncated: 64 more characters]</pre>
<p>Regular expression ek keyword (secret, password, community, key), optional number (encryption type) aur uske baad ki value dhoondhti hai, aur value ko <code>[REDACTED]</code> se badal deti hai. <code>re.IGNORECASE</code> capital letters ko ignore karta hai. Hostname, description aur address lines bina badle guzar jaati hain. <code>limit</code> function phir text ko 140 characters par kaatta hai aur batata hai kitna hataya gaya. <b>Pattern se redaction safety net hai, guarantee nahi</b>: anjaane formats nikal sakte hain, isliye read-only account aur commands ka dhyan se chunav pehle aate hain.</p>
<div class="warn"><p><b>Aam galti.</b> System prompt mein "bas test ke liye" password daalna. Test prompts tickets, chats aur logs mein copy ho jaate hain. Environment mein throwaway lab credential use karo, aur baad mein rotate karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Layers aur rule "allow-list, block-list nahi" yaad rakho. Secrets server environment ya secrets store mein hote hain, prompts, arguments, outputs ya logs mein kabhi nahi. Redaction defence in depth hai, least privilege ka replacement nahi.</p></div>
<div class="scn"><h4>Jawab mein community string</h4><p>Ek user ne assistant se kaha "R1 ki SNMP settings summarise karo". Tool ke pehle version ne poori running configuration lauta di, aur model ne apne jawab mein SNMP community quote kar di, jo bahut logon ko dikhne wale ticket mein paste hui. Fix ke teen hisse the: tool ab sirf parsed, non-secret fields lautata hai, kisi bhi text par redaction layer chalti hai, aur community rotate ki gayi.</p><p><b>Lesson:</b> Sirf wahi fields lautao jo sawaal ko chahiye, baaki redact karo.</p></div>
<div class="iv"><p class="q">"Network MCP server ke aas-paas kaunse guardrails lagaoge?"</p><p>Tools aur devices ke liye allow-lists; code mein strict argument validation; per-user aur per-device rate limits, timeouts aur output caps; dedicated read-only device account; credentials sirf server environment ya secrets store mein aur prompts, arguments ya output mein kabhi nahi; sensitive patterns ki redaction; aur poori audit logging. Main inhe server code mein enforce karta hoon kyunki prompts security controls nahi hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Layers mein banao: allow-list, validation, limits, least privilege, audit.</li><li>Allow-lists block-lists se behtar hain.</li><li>Rate limits, timeouts aur output caps devices aur model dono ko bachate hain.</li><li>Secrets server environment mein rehte hain, prompts, arguments, outputs ya logs mein kabhi nahi.</li><li>Redaction safety net hai; read-only account buniyaad hai.</li></ul></div>
`}};export{e as default};