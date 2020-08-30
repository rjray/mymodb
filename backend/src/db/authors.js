/*
 * All database operations that focus on authors.
 */

const {
  Author,
  AuthorAlias,
  Reference,
  RecordType,
  Magazine,
  MagazineIssue,
  sequelize,
} = require("../models");
const { sortBy } = require("../lib/utils");

function convertAliases(aliasList) {
  const aliases = aliasList.map((item) => {
    item = item.get();
    delete item.AuthorId;
    return item;
  });
  aliases.sort(sortBy("name"));

  return aliases;
}

// Most-basic author request. Single author with any aliases.
const fetchSingleAuthorSimple = async (id) => {
  let author = await Author.findByPk(id, { include: [AuthorAlias] }).catch(
    (error) => {
      throw new Error(error);
    }
  );

  if (author) {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;
  } else {
    author = null;
  }

  return author;
};

// Single author with any aliases and a count of their references.
const fetchSingleAuthorWithRefCount = async (id) => {
  let author = await Author.findByPk(id, {
    include: [
      AuthorAlias,
      { model: Reference, as: "References", attributes: ["id"] },
    ]
  }).catch((error) => { throw new Error(error); });

  if (author) {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;
    author.refcount = author.References.length;
    delete author.References;
  } else {
    author = null;
  }

  return author;
};

// Fetch a single author with aliases and all references they're listed on.
const fetchSingleAuthorComplex = async (id) => {
  let author = await Author.findByPk(id, {
    include: [
      AuthorAlias,
      {
        model: Reference,
        as: "References",
        include: [RecordType, { model: MagazineIssue, include: [Magazine] }],
      },
    ],
  });

  if (author) {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;

    author.references = author.References.map((item) => {
      item = item.get();
      delete item.AuthorsReferences;
      if (item.MagazineIssue) {
        item.Magazine = item.MagazineIssue.Magazine.get();
        item.MagazineIssue = item.MagazineIssue.get();
        delete item.MagazineIssue.Magazine;
      }
      return item;
    });
    delete author.References;
  } else {
    author = null;
  }

  return author;
};

// Fetch all authors along with aliases. Returns an object with the count in a
// property called "count" and all the authors in a property called "authors".
const fetchAllAuthorsWithAliasesAndCount = async (opts = {}) => {
  const count = await Author.count();
  const results = await Author.findAll({
    include: [AuthorAlias],
    ...opts,
  });

  const authors = results.map((author) => {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;

    return author;
  });

  return { count, authors };
};

// Fetch all authors along with a count of how many references they're credited
// on. Returns the same shape of object as above.
const fetchAllAuthorsWithRefcountAndCount = async (opts = {}) => {
  const count = await Author.count();
  const results = await Author.findAll({
    include: [
      AuthorAlias,
      { model: Reference, as: "References", attributes: ["id"] },
    ],
    ...opts,
  });

  const authors = results.map((author) => {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;
    author.refcount = author.References.length;
    delete author.References;

    return author;
  });

  return { count, authors };
};

// LEGACY
// Fetch all authors along with a count of how many references they're credited
// on.
const fetchAllAuthorsWithRefcount = async (opts = {}) => {
  let authors = await Author.findAll({
    include: [
      AuthorAlias,
      { model: Reference, as: "References", attributes: ["id"] },
    ],
    ...opts,
  });

  authors = authors.map((author) => {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;
    author.refcount = author.References.length;
    delete author.References;

    return author;
  });

  return authors;
};

// Fetch all authors along with aliases.
const fetchAllAuthorsWithAliases = async (opts = {}) => {
  const allAuthors = await Author.findAll({
    include: [AuthorAlias],
    ...opts,
  });

  const authors = allAuthors.map((author) => {
    author = author.get();
    author.aliases = convertAliases(author.AuthorAliases);
    delete author.AuthorAliases;

    return author;
  });

  return authors;
};

// Create a new author using the content in data.
const createAuthor = async (data) => {
  const newId = await sequelize.transaction(async (txn) => {
    const author = await Author.create(
      { name: data.name },
      { transaction: txn }
    ).catch((error) => {
      if (error.hasOwnProperty("errors")) {
        const specific = error.errors[0];
        throw new Error(specific.message);
      } else {
        throw new Error(error.message);
      }
    });

    if (data.aliases.length) {
      let aliases = data.aliases.filter((item) => !item.deleted)
        .map((alias) => alias.name);

      for (let name of aliases) {
        await author.createAuthorAlias({ name: name }, { transaction: txn });
      }
    }

    return author.id;
  });

  return fetchSingleAuthorSimple(newId);
};

// Update a single author using the content in data.
const updateAuthor = async (id, data) => {
  return Author.findByPk(id, { include: [AuthorAlias] })
    .then((author) => {
      return sequelize.transaction(async (txn) => {
        if (data.name !== author.name) {
          await author.update({ name: data.name }, { transaction: txn });
        }

        let aliases = {},
          toDelete = [],
          toAdd = [],
          toUpdate = [];
        author.AuthorAliases.forEach((alias) => (aliases[alias.id] = alias));

        // Gather those that should be deleted. This will create an array of
        // objects due to using the table derived from author.
        data.aliases
          .filter((alias) => alias.id != 0 && alias.deleted)
          .forEach((alias) => {
            if (aliases.hasOwnProperty(alias.id)) {
              toDelete.push(aliases[alias.id]);
            }
          });
        // Gather those that should be added. For this, we only need the name
        // field.
        data.aliases
          .filter((alias) => alias.id == 0 && alias.name.length != 0)
          .forEach((alias) => toAdd.push(alias.name));
        // Gather the ones that need to be updated. Here we store the object
        // itself (as taken from the table).
        data.aliases
          .filter((alias) => alias.id != 0 && !alias.deleted)
          .forEach((alias) => {
            if (aliases.hasOwnProperty(alias.id)) {
              if (aliases[alias.id].name != alias.name) {
                let aliasToUpdate = aliases[alias.id];
                aliasToUpdate.name = alias.name;
                toUpdate.push(aliasToUpdate);
              }
            }
          });

        for (let alias of toDelete) {
          await author.removeAuthorAlias(alias, { transaction: txn });
          await alias.destroy({ transaction: txn });
        }
        for (let alias of toUpdate) {
          await alias.save({ transaction: txn });
        }
        for (let name of toAdd) {
          await author.createAuthorAlias({ name: name }, { transaction: txn });
        }
      });
    })
    .then(() => {
      return fetchSingleAuthorSimple(id);
    });
};

// Delete a single Author from the database.
const deleteAuthor = async (id) => {
  return Author.destroy({ where: { id } });
};

module.exports = {
  fetchSingleAuthorSimple,
  fetchSingleAuthorWithRefCount,
  fetchSingleAuthorComplex,
  fetchAllAuthorsWithRefcount,
  fetchAllAuthorsWithAliases,
  fetchAllAuthorsWithAliasesAndCount,
  fetchAllAuthorsWithRefcountAndCount,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
