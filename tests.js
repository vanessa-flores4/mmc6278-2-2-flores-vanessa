const exec = require("child_process").exec;
const fs = require("fs").promises;
const path = require("path");
const { expect } = require("chai");

function execAsync(cmd, cwd = ".") {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);
    });
  });
}

function run(cmd, cwd = ".") {
  return new Promise((resolve, reject) => {
    exec(
      `node ${path.resolve("./index")} ${cmd}`,
      { cwd },
      (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stdout) return resolve(stdout);
        if (stderr) return resolve(stderr);
      }
    );
  });
}

describe("Quote App", () => {
  let quoteFile
  const quotes = [
    {
      quote: 'Programmer: A machine that turns coffee into code.',
      author: null
    },
    {
      quote: 'Algorithm: Word used by programmers when they don’t want to explain what they did.',
      author: null
    },
    {
      quote: 'Software and cathedrals are much the same – first we build them, then we pray.',
      author: 'Sam Redwine'
    },
    {
      quote: 'Walking on water and developing software from a specification are easy if both are frozen.',
      author: 'Edward V Berard'
    },
    {
      quote: 'There are only two kinds of languages: the ones people complain about and the ones nobody uses.',
      author: 'Bjarne Stroustrup'
    },
    {
      quote: 'To understand recursion, you must first understand recursion.',
      author: null
    }
  ]
  const addQuote = (quote, author) => run(`addQuote ${quote ? `"${quote}"`: ""}` + (author ? ` "${author}"` : ""))
  const getQuote = () => run("getQuote");
  before(async () => {
    const stdout = await execAsync("ls");
    expect(stdout).to.contain("quotes.txt");
    await fs.rename('quotes.txt', '_quotes.txt').catch(() => {})
  });
  afterEach(async () => {
    await fs.unlink('quotes.txt').catch(() => {})
  })
  after(async () => {
    await fs.rename('_quotes.txt', 'quotes.txt').catch(() => {})
  })
  it('should add quote to file', async () => {
    const {quote, author} = quotes.find(({author}) => author)
    await addQuote(quote, author)
    const quoteFile = await fs.readFile('./quotes.txt', 'UTF-8')
    expect(quoteFile).to.contain(quote)
  })
  it('should add quote to file with author', async () => {
    const {quote, author} = quotes.find(({author}) => author)
    await addQuote(quote, author)
    const quoteFile = await fs.readFile('./quotes.txt', 'UTF-8')
    expect(quoteFile).to.contain(author)
  })
  it("should log quote", async () => {
    const {quote, author} = quotes.find(({author}) => author)
    await addQuote(quote, author)
    const output = await getQuote()
    expect(output).to.contain(quote);
  });
  it("should log quote with author if author given", async () => {
    const {quote, author} = quotes.find(({author}) => author)
    await addQuote(quote, author)
    const output = await getQuote()
    expect(output).to.contain(quote);
    expect(output).to.contain(author);
  });
  it('should credit quote as "Anonymous" if author is not given', async () => {
    const {quote, author} = quotes.find(({author}) => !author)
    await addQuote(quote)
    const output = await getQuote()
    expect(output).to.contain(quote)
    expect(output).to.contain('Anonymous')
  })
  it('should add multiple quotes to file', async () => {
    for (const {quote, author} of quotes) {
      await addQuote(quote, author)
    }
    const quoteFile = await fs.readFile('./quotes.txt', 'UTF-8')

    for (const {quote, author} of quotes) {
      expect(quoteFile).to.contain(quote)
      expect(quoteFile).to.contain(author || 'Anonymous')
    }
  })
  it('should retrieve random quotes', async () => {
    for (const {quote, author} of quotes) {
      await addQuote(quote, author)
    }
    const outputs = new Set()
    let attempts = 0
    while(outputs.size < 2) {
      outputs.add(await getQuote())
      attempts++
      if (attempts > 20) break;
    }
    expect(outputs.size).to.eq(2)
  })
  it('should throw error if no quote is given', async () => {
    let output
    let error
    try {
      await addQuote()
      output = await getQuote()
    } catch(err) {
      error = err
    } finally {
      expect(error).to.exist
      expect(output).to.not.exist
    }
  })
});
