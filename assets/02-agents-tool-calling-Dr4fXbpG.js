var e={id:`agents-tool-calling`,h:{en:`How an agent calls tools`,hi:`Agent tools ko kaise call karta hai`},body:{en:`
<p><b>One idea:</b> a language model on its own can only produce text. It cannot log in to a router. An <b>agent</b> adds a loop around the model: the model <i>asks</i> for a tool in a structured message, the program <i>runs</i> the tool, and the result goes back to the model, which then answers or asks for another tool. The model proposes; the program disposes.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Question from the user to Model answer or tool call to Program checks and runs to Result back to the model"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Question</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">from the user</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><text x="161" y="70" text-anchor="middle" class="svg-accent" font-size="11">asks</text><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Model</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">answer or tool call</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><text x="319" y="70" text-anchor="middle" class="svg-accent" font-size="11">runs</text><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Program</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">checks and runs</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><text x="477" y="70" text-anchor="middle" class="svg-accent" font-size="11">feeds</text><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">back to the model</text></svg><p class="cap">The agent loop repeats until the model gives a final answer or a step limit is reached.</p></div>
<h3>What the model is given</h3>
<p>With every request the program sends the model: the conversation so far, the system instructions, and a list of <b>tool definitions</b>. Each definition has a <b>name</b>, a plain-language <b>description</b> and a <b>parameter schema</b> that says what inputs are allowed (for example, "device: one of R1, R2, SW1"). The model reads these like a menu and decides whether to answer directly or to call a tool. Good descriptions matter, because the model chooses tools by reading them.</p>
<h3>What a tool call looks like</h3>
<p>The model does not run anything. It outputs a structured message such as the one below. The exact format differs between providers, so this is a generic illustration (reference only), but every provider has the same two parts: a tool name and JSON arguments.</p>
<pre class="code"><span class="c">// Reference message format (not run in the simulator)</span>
{
  "type": "tool_call",
  "name": "show_interfaces_brief",
  "arguments": { "device": "R1" }
}</pre>
<p><b>JSON</b> is a text format of labels and values inside curly braces. Here the model asks for the tool <code>show_interfaces_brief</code> with the argument <code>device</code> set to <code>R1</code>. Think of it as a filled-in request slip. The program must treat this slip as <b>untrusted input</b>: the model might ask for a tool that does not exist, a device you never allowed, or an argument of the wrong type.</p>
<h3>A complete loop you can run</h3>
<pre class="code"><span class="c"># A teaching sketch. fake_model is NOT a real language model: it is a tiny rule-based stand-in</span>
<span class="c"># so you can see the shape of the loop. Device data is canned (made up).</span>

def fake_model(question, history):
    """Return either a tool call or a final answer, like a real model would."""
    if not history:                                    # nothing learned yet -&gt; ask for a tool
        return {"type": "tool_call", "name": "show_version", "arguments": {"device": "R1"}}
    last = history[-1]                                 # we have a tool result -&gt; answer from it
    return {"type": "answer", "text": "R1 is running " + last["version"] + "."}

TOOLS = {"show_version": lambda device: {"device": device, "version": "17.9.x (sample)"}}

def run_agent(question, max_steps=5):
    history = []
    for step in range(1, max_steps + 1):
        decision = fake_model(question, history)
        if decision["type"] == "answer":
            print(f"step {step}: final answer -&gt; {decision['text']}")
            return decision["text"]
        name, args = decision["name"], decision["arguments"]
        print(f"step {step}: model asks for tool {name} with {args}")
        if name not in TOOLS:                          # the PROGRAM decides what is allowed
            print("          refused: unknown tool")
            return None
        result = TOOLS[name](**args)
        print(f"          tool returned {result}")
        history.append(result)
    print("stopped: step limit reached")

run_agent("Which software version is R1 running?")</pre>
<pre class="out">step 1: model asks for tool show_version with {'device': 'R1'}
          tool returned {'device': 'R1', 'version': '17.9.x (sample)'}
step 2: final answer -&gt; R1 is running 17.9.x (sample).</pre>
<ul><li><code>fake_model</code> stands in for the language model. It first asks for a tool, then answers once it has a tool result in <code>history</code>. A real model works the same way from the outside, only far more flexibly.</li><li><code>for step in range(1, max_steps + 1)</code> is the loop and <code>max_steps</code> is the <b>step limit</b>, a safety brake. Without it, a confused model could ask for tools forever.</li><li><code>if name not in TOOLS</code> is the program refusing an unknown tool. <b>The program, not the model, decides what is allowed.</b></li><li><code>TOOLS[name](**args)</code> calls the chosen function with the arguments from the model. The two stars unpack a dictionary into named arguments.</li><li>The result is added to <code>history</code> so the next model call can use it. That is how the model "learns" what the device said.</li></ul>
<h3>Why this matters for safety</h3>
<p>Every guard in later chapters sits at the point marked "the program decides". Because the model's output is only a request, you can validate it, refuse it, ask a human, and log it. If you instead gave the model a raw shell, there would be nothing to validate. This is why <b>tools</b> beat <b>free-form commands</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Letting the model write a command string that your code simply executes. The model can then run anything the account can run. Offer narrow tools such as "show interfaces brief" with a device argument instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be ready to state who does what: the <b>model</b> chooses a tool and arguments; the <b>agent program</b> validates, executes and feeds back the result; a <b>step limit</b> ends runaway loops. The model never connects to the device.</p></div>
<div class="scn"><h4>The agent that asked 40 times</h4><p>A prototype agent kept calling the same tool with slightly different arguments because it never got the answer it wanted. It had no step limit and the tool slowly loaded a device with repeated sessions. A limit of five steps, a per-device rate limit and a clear "no data found" result stopped the pattern.</p><p><b>Lesson:</b> Add step limits and rate limits to every agent.</p></div>
<div class="iv"><p class="q">"How does tool calling work between a model and a program?"</p><p>The program sends the model the conversation plus tool definitions (name, description, parameter schema). The model replies with either text or a structured tool call with a name and JSON arguments. The program validates the call, executes it if allowed, and sends the result back as a new message. The loop repeats until the model answers or a step limit stops it. The model never executes anything itself.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>The model proposes a tool call; the program validates and executes it.</li><li>Tool definitions have a name, a description and a parameter schema.</li><li>Treat every model-produced argument as untrusted input.</li><li>Add a step limit; unknown tools are refused by the program.</li><li>Narrow tools are safer than free-form command strings.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> language model akela sirf text bana sakta hai. Woh router mein login nahi kar sakta. <b>Agent</b> model ke aas-paas ek loop jodta hai: model structured message mein tool <i>maangta</i> hai, program tool <i>chalata</i> hai, aur result model ko wapas jaata hai, jo phir jawab deta hai ya aur tool maangta hai. Model propose karta hai; program decide karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Sawaal user se to Model jawab ya tool call to Program check karke chalata to Result model ko wapas"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Sawaal</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">user se</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><text x="161" y="70" text-anchor="middle" class="svg-accent" font-size="11">asks</text><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Model</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">jawab ya tool call</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><text x="319" y="70" text-anchor="middle" class="svg-accent" font-size="11">runs</text><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Program</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">check karke chalata</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><text x="477" y="70" text-anchor="middle" class="svg-accent" font-size="11">feeds</text><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">model ko wapas</text></svg><p class="cap">Agent loop tab tak dohrata hai jab tak model final jawab na de ya step limit na aa jaaye.</p></div>
<h3>Model ko kya diya jaata hai</h3>
<p>Har request ke saath program model ko bhejta hai: ab tak ki conversation, system instructions, aur <b>tool definitions</b> ki list. Har definition mein ek <b>name</b>, saadi bhasha mein <b>description</b> aur ek <b>parameter schema</b> hota hai jo batata hai ki kaunse inputs allowed hain (jaise "device: R1, R2, SW1 mein se ek"). Model inhe menu ki tarah padhta hai aur decide karta hai ki seedha jawab de ya tool call kare. Achhi descriptions zaroori hain, kyunki model tools ko unhe padhkar chunta hai.</p>
<h3>Tool call kaisa dikhta hai</h3>
<p>Model kuch nahi chalata. Woh neeche jaisa structured message output karta hai. Exact format providers ke beech alag hota hai, isliye yeh generic illustration hai (sirf reference), lekin har provider mein wahi do hisse hote hain: tool name aur JSON arguments.</p>
<pre class="code"><span class="c">// Reference message format (not run in the simulator)</span>
{
  "type": "tool_call",
  "name": "show_interfaces_brief",
  "arguments": { "device": "R1" }
}</pre>
<p><b>JSON</b> labels aur values ka text format hai jo curly braces ke andar hota hai. Yahan model tool <code>show_interfaces_brief</code> maangta hai, argument <code>device</code> ko <code>R1</code> set karke. Ise bhari hui request slip samjho. Program ko is slip ko <b>untrusted input</b> maanna chahiye: model aisa tool maang sakta hai jo hai hi nahi, aisa device jo aapne allow nahi kiya, ya galat type ka argument.</p>
<h3>Poora loop jo aap chala sakte ho</h3>
<pre class="code"><span class="c"># A teaching sketch. fake_model is NOT a real language model: it is a tiny rule-based stand-in</span>
<span class="c"># so you can see the shape of the loop. Device data is canned (made up).</span>

def fake_model(question, history):
    """Return either a tool call or a final answer, like a real model would."""
    if not history:                                    # nothing learned yet -&gt; ask for a tool
        return {"type": "tool_call", "name": "show_version", "arguments": {"device": "R1"}}
    last = history[-1]                                 # we have a tool result -&gt; answer from it
    return {"type": "answer", "text": "R1 is running " + last["version"] + "."}

TOOLS = {"show_version": lambda device: {"device": device, "version": "17.9.x (sample)"}}

def run_agent(question, max_steps=5):
    history = []
    for step in range(1, max_steps + 1):
        decision = fake_model(question, history)
        if decision["type"] == "answer":
            print(f"step {step}: final answer -&gt; {decision['text']}")
            return decision["text"]
        name, args = decision["name"], decision["arguments"]
        print(f"step {step}: model asks for tool {name} with {args}")
        if name not in TOOLS:                          # the PROGRAM decides what is allowed
            print("          refused: unknown tool")
            return None
        result = TOOLS[name](**args)
        print(f"          tool returned {result}")
        history.append(result)
    print("stopped: step limit reached")

run_agent("Which software version is R1 running?")</pre>
<pre class="out">step 1: model asks for tool show_version with {'device': 'R1'}
          tool returned {'device': 'R1', 'version': '17.9.x (sample)'}
step 2: final answer -&gt; R1 is running 17.9.x (sample).</pre>
<ul><li><code>fake_model</code> language model ki jagah khada hai. Pehle woh tool maangta hai, phir <code>history</code> mein tool result aane par jawab deta hai. Asli model bahar se waise hi kaam karta hai, bas bahut zyada flexibly.</li><li><code>for step in range(1, max_steps + 1)</code> loop hai aur <code>max_steps</code> <b>step limit</b> hai, ek safety brake. Iske bina confused model hamesha tools maangta reh sakta hai.</li><li><code>if name not in TOOLS</code> program ka anjaane tool ko mana karna hai. <b>Kya allowed hai yeh program decide karta hai, model nahi.</b></li><li><code>TOOLS[name](**args)</code> chune hue function ko model ke arguments ke saath call karta hai. Do stars dictionary ko named arguments mein kholte hain.</li><li>Result <code>history</code> mein jodta hai taaki agli model call use use kar sake. Isi tarah model "seekhta" hai ki device ne kya kaha.</li></ul>
<h3>Safety ke liye yeh kyun zaroori hai</h3>
<p>Aage ke chapters ka har guard us point par baithta hai jahan "program decide karta hai". Kyunki model ka output sirf ek request hai, aap use validate kar sakte ho, refuse kar sakte ho, kisi insaan se poochh sakte ho, aur log kar sakte ho. Agar aap model ko raw shell dete to validate karne ko kuch na hota. Isiliye <b>tools</b>, <b>free-form commands</b> se behtar hain.</p>
<div class="warn"><p><b>Aam galti.</b> Model ko command string likhne dena jise aapka code seedha execute kare. Tab model woh sab chala sakta hai jo account chala sakta hai. Iski jagah device argument ke saath "show interfaces brief" jaise narrow tools do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batane ke liye taiyaar raho ki kaun kya karta hai: <b>model</b> tool aur arguments chunta hai; <b>agent program</b> validate, execute aur result wapas feed karta hai; <b>step limit</b> bhaagte loops ko rokti hai. Model kabhi device se connect nahi karta.</p></div>
<div class="scn"><h4>Agent jisne 40 baar poochha</h4><p>Ek prototype agent usi tool ko thode alag arguments ke saath baar-baar call karta raha kyunki use wanted jawab nahi mil raha tha. Uski koi step limit nahi thi aur tool ne device par baar-baar sessions se dheere-dheere load daal diya. Paanch steps ki limit, per-device rate limit aur saaf "no data found" result ne pattern roka.</p><p><b>Lesson:</b> Har agent mein step limits aur rate limits jodo.</p></div>
<div class="iv"><p class="q">"Model aur program ke beech tool calling kaise kaam karti hai?"</p><p>Program model ko conversation aur tool definitions (name, description, parameter schema) bhejta hai. Model ya to text ya name aur JSON arguments ke saath structured tool call se jawab deta hai. Program call validate karta hai, allowed ho to execute karta hai, aur result naye message ke roop mein wapas bhejta hai. Loop tab tak dohrata hai jab tak model jawab na de ya step limit na rok de. Model khud kuch execute nahi karta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Model tool call propose karta hai; program validate aur execute karta hai.</li><li>Tool definitions mein name, description aur parameter schema hota hai.</li><li>Model ke banaye har argument ko untrusted input maano.</li><li>Step limit jodo; anjaane tools program refuse karta hai.</li><li>Narrow tools free-form command strings se safer hain.</li></ul></div>
`}};export{e as default};